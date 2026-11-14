/**
 * Připojení k Supabase (přihlášení + databáze v cloudu).
 *
 * Obě hodnoty jsou veřejné – smí být v repozitáři. Data chrání pravidla
 * v supabase/schema.sql (každý účet vidí jen své řádky), ne utajení klíče.
 * Sestavení s VITE_LOCAL_ONLY=1 vypne cloud a aplikace běží v místním režimu
 * (data jen v prohlížeči) – hodí se pro vývoj a testy.
 */
const LOCAL_ONLY = import.meta.env.VITE_LOCAL_ONLY === '1'
export const SUPABASE_URL: string = LOCAL_ONLY ? '' : import.meta.env.VITE_SUPABASE_URL || 'https://xjvcqndwsidperlyzpgy.supabase.co'
export const SUPABASE_ANON_KEY: string = LOCAL_ONLY ? '' : import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NySZM7tWEQlanCwZfF7GsQ_3squ4_UA'

export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
