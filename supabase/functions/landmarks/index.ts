// Supabase Edge Function: AI návrh anatomických bodů na fotce psa.
// Nasazení: supabase functions deploy landmarks
// Tajný klíč: supabase secrets set ANTHROPIC_API_KEY=...
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const VIEW: Record<string, string> = {
  left: "the dog's LEFT side (lateral view)",
  right: "the dog's RIGHT side (lateral view)",
  front: 'the front (cranial view; the dog\'s left side appears on the right of the image)',
  rear: 'behind (caudal view; the dog\'s left side appears on the left of the image)',
  top: 'above (dorsal view)',
}

const SYSTEM = `You locate anatomical landmarks on photographs of standing dogs for a canine physiotherapist.
A human reviews and corrects every point afterwards, so give your best estimate of each landmark that is visible and mark landmarks that are hidden, cropped out or impossible to place as not visible rather than guessing.
Landmarks are bony points: place each one on the skin directly over the bone, estimating through coat and muscle from the dog's outline and proportions.
Coordinates are integers from 0 to 1000: x is the fraction of image width from the left edge, y is the fraction of image height from the top edge.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    // Veřejný (anon) klíč sám nestačí – funkci smí volat jen přihlášený účet.
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return json({ error: 'unauthorized' }, 401)

    const { image, view, landmarks } = await req.json()
    if (typeof image !== 'string' || image.length > 6_000_000 || !VIEW[view] || !Array.isArray(landmarks) || landmarks.length > 40) return json({ error: 'bad request' }, 400)
    const ids: string[] = landmarks.map((l: { id: string }) => String(l.id))

    const client = new Anthropic()
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              points: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { id: { type: 'string', enum: ids }, x: { type: 'integer' }, y: { type: 'integer' }, visible: { type: 'boolean' } },
                  required: ['id', 'x', 'y', 'visible'],
                  additionalProperties: false,
                },
              },
            },
            required: ['points'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            {
              type: 'text',
              text: `This photo shows a standing dog from ${VIEW[view]}. Return one entry for each of these landmarks:\n${landmarks
                .map((l: { id: string; description: string }) => `- ${l.id}: ${String(l.description).slice(0, 300)}`)
                .join('\n')}`,
            },
          ],
        },
      ],
    })
    if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 422)
    const text = response.content.find((b) => b.type === 'text')
    if (!text || text.type !== 'text') return json({ error: 'empty' }, 502)
    return json(JSON.parse(text.text))
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'rate limited' }, 429)
    if (e instanceof Anthropic.APIError) return json({ error: `ai ${e.status}` }, 502)
    return json({ error: 'failed' }, 500)
  }
})
