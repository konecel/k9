# K9 Biomechanika

Aplikace pro fyzioterapeuty psů: profil psa, databáze plemen podle FCI s biomechanickými šablonami, statická a dynamická (pohybová) analýza a vizuální report s grafy.

## Spuštění

```bash
npm install
npm run dev
```

Sestavení pro produkci: `npm run build`.

## Stav

- Bez nastaveného Supabase běží aplikace v místním režimu: data jsou jen v prohlížeči na daném zařízení (záznamy v localStorage, fotky v IndexedDB).
- Nomenklatura FCI v `src/lib/fci-data.ts` je převzatá z fci.be (stav k 13. 11. 2026); české názvy a archetypy jsou doplněné ručně.
- Referenční rozsahy šablon v `src/lib/breeds.ts` a meze u hodnot z fotek v `src/lib/landmarks.ts` jsou orientační a čekají na odbornou revizi.

## Účty a cloud (Supabase)

1. Založte projekt na supabase.com.
2. V SQL Editoru spusťte `supabase/schema.sql` (tabulky, soukromé úložiště fotek a pravidla „každý vidí jen své“).
3. Do proměnných repozitáře na GitHubu (Settings → Secrets and variables → Actions → Variables) uložte `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.

## AI návrh bodů na fotkách

Funkce `supabase/functions/landmarks` pošle fotku modelu Claude a vrátí navržené body; klíč k AI zůstává na serveru. Volat ji smí jen přihlášený účet.

```bash
supabase functions deploy landmarks
```

```bash
supabase secrets set ANTHROPIC_API_KEY=váš-klíč
```

Každý návrh AI je v aplikaci označený a jde ručně posunout nebo odebrat; ručně umístěné body AI nepřepisuje.
