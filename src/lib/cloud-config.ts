/**
 * Připojení k Supabase (přihlášení + databáze v cloudu).
 *
 * Obě hodnoty jsou veřejné – smí být v repozitáři. Data chrání pravidla
 * v supabase/schema.sql (každý účet vidí jen své řádky), ne utajení klíče.
 * Dokud jsou prázdné, aplikace běží v místním režimu (data jen v prohlížeči).
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
