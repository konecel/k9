import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { startSync, stopSync } from './sync'
import { supabase } from './supabase'
import { useTrial } from './trial'

/** Signed-in session; `undefined` while it is being restored. Starts/stops cloud sync with it. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null)
  const userId = session?.user.id

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      // signing out wipes everything from memory so the next person sees nothing
      if (event === 'SIGNED_OUT') stopSync(true)
      if (s) useTrial.getState().stop()
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return
    void startSync()
    return () => stopSync()
  }, [userId])

  return session
}

const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Nesprávný e-mail nebo heslo.'],
  [/already registered/i, 'Účet s tímto e-mailem už existuje. Přihlaste se.'],
  [/email not confirmed/i, 'E-mail ještě není potvrzený. Klikněte na odkaz, který jsme vám poslali.'],
  [/password should be at least/i, 'Heslo musí mít alespoň 6 znaků.'],
  [/rate limit/i, 'Příliš mnoho pokusů. Zkuste to za chvíli znovu.'],
  [/failed to fetch|network/i, 'Nepodařilo se spojit se serverem. Zkontrolujte připojení k internetu.'],
]
export const authMessage = (raw: string) => MESSAGES.find(([re]) => re.test(raw))?.[1] ?? raw
