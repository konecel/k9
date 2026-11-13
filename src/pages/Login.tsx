import { useState } from 'react'
import { Button, Field, inputCls } from '../components/ui'
import { authMessage } from '../lib/auth'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { useTrial } from '../lib/trial'

export default function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const startTrial = useTrial((t) => t.start)
  const hasTrialData = useStore((st) => st.dogs.length > 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError(null)
    setInfo(null)
    const creds = { email: email.trim(), password }
    const { data, error } = mode === 'in' ? await supabase.auth.signInWithPassword(creds) : await supabase.auth.signUp(creds)
    setBusy(false)
    if (error) setError(authMessage(error.message))
    else if (mode === 'up' && !data.session) setInfo('Účet je vytvořený. Potvrďte ho odkazem, který jsme poslali na váš e-mail, a pak se přihlaste.')
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl border border-line bg-white p-6">
      <h1 className="text-xl font-bold">{mode === 'in' ? 'Přihlášení' : 'Nový účet'}</h1>
      <p className="mt-1 text-sm text-muted">Každý účet vidí jen své psy a svá měření.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="E-mail">
          <input type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Heslo" hint={mode === 'up' ? 'Alespoň 6 znaků.' : undefined}>
          <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p role="alert" className="rounded-md bg-sig/10 px-3 py-2 text-sm text-ink">{error}</p>}
        {info && <p role="status" className="rounded-md bg-brand-soft px-3 py-2 text-sm text-ink">{info}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Chvilku…' : mode === 'in' ? 'Přihlásit se' : 'Vytvořit účet'}</Button>
      </form>
      <button className="mt-4 text-sm text-brand underline" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(null); setInfo(null) }}>
        {mode === 'in' ? 'Nemám účet – vytvořit' : 'Už mám účet – přihlásit se'}
      </button>
      {hasTrialData && <p className="mt-3 text-xs text-muted">Psi a měření ze zkušebního režimu se po přihlášení uloží do vašeho účtu.</p>}
      <div className="mt-5 border-t border-line pt-4">
        <Button variant="ghost" onClick={startTrial}>{hasTrialData ? 'Zpět do zkušebního režimu' : 'Vyzkoušet bez přihlášení'}</Button>
        <p className="mt-2 text-xs text-muted">Zkušební režim nic neukládá a neumožňuje tisk ani export reportu.</p>
      </div>
    </div>
  )
}
