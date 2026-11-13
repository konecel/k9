# K9 Biomechanika

Aplikace pro fyzioterapeuty psů: profil psa, databáze plemen podle FCI s biomechanickými šablonami, statická a dynamická (pohybová) analýza a vizuální report s grafy.

## Spuštění

```bash
npm install
npm run dev
```

Sestavení pro produkci: `npm run build`.

## Stav V1

- Data se ukládají jen v prohlížeči na daném zařízení (localStorage), bez přihlášení.
- Nomenklatura FCI v `src/lib/fci-data.ts` je převzatá z fci.be (stav k 13. 11. 2026); české názvy a archetypy jsou doplněné ručně.
- Referenční rozsahy šablon v `src/lib/breeds.ts` jsou orientační a čekají na odbornou revizi.
