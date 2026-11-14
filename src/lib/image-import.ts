/** Delší strana uložené fotky v pixelech – dost na přesné umístění bodů, málo na úložiště. */
const MAX_SIDE = 2000

type Drawable = ImageBitmap | HTMLImageElement | HTMLCanvasElement

async function sniff(file: File): Promise<'heic' | 'tiff' | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const ascii = String.fromCharCode(...b)
  if (ascii.slice(4, 8) === 'ftyp' && /heic|heix|hevc|hevx|heim|heis|mif1|msf1/.test(ascii.slice(8, 12))) return 'heic'
  if (ascii.startsWith('II*\0') || ascii.startsWith('MM\0*')) return 'tiff'
  return null
}

function viaImg(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')) }
    img.src = url
  })
}

/** Nejdřív to, co umí prohlížeč sám (JPEG, PNG, WebP, GIF, BMP, AVIF, SVG; v Safari i HEIC), pak převodníky. */
async function decode(file: File): Promise<Drawable> {
  try { return await createImageBitmap(file) } catch { /* další pokus */ }
  try { return await viaImg(file) } catch { /* další pokus */ }
  const kind = await sniff(file)
  if (kind === 'heic') {
    const { heicTo } = await import('heic-to')
    return createImageBitmap(await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 }))
  }
  if (kind === 'tiff') {
    const UTIF = (await import('utif2')).default
    const buf = await file.arrayBuffer()
    const ifd = UTIF.decode(buf)[0]
    UTIF.decodeImage(buf, ifd)
    const canvas = document.createElement('canvas')
    canvas.width = ifd.width
    canvas.height = ifd.height
    canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(UTIF.toRGBA8(ifd)), ifd.width, ifd.height), 0, 0)
    return canvas
  }
  throw new Error('Tento soubor se nepodařilo otevřít jako obrázek. Podporované jsou JPEG, PNG, WebP, HEIC/HEIF, AVIF, GIF, BMP a TIFF.')
}

const size = (d: Drawable) => (d instanceof HTMLImageElement ? { w: d.naturalWidth, h: d.naturalHeight } : { w: d.width, h: d.height })

function toJpeg(source: Drawable, maxSide: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> {
  const { w: sw, h: sh } = size(source)
  if (!sw || !sh) throw new Error('Obrázek má nulovou velikost.')
  const k = Math.min(1, maxSide / Math.max(sw, sh))
  const [w, h] = [Math.round(sw * k), Math.round(sh * k)]
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(source, 0, 0, w, h)
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve({ blob, w, h }) : reject(new Error('Obrázek se nepodařilo převést.'))), 'image/jpeg', quality))
}

/** Libovolný obrázek → JPEG rozumné velikosti. */
export async function importImage(file: File) {
  return toJpeg(await decode(file), MAX_SIDE, 0.88)
}

/** Zmenšená kopie v base64 pro AI. */
export async function jpegBase64(blob: Blob, maxSide: number): Promise<string> {
  const small = await toJpeg(await createImageBitmap(blob), maxSide, 0.85)
  const bytes = new Uint8Array(await small.blob.arrayBuffer())
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
