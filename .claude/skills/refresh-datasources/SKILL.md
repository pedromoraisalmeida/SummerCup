---
name: refresh-datasources
description: Fetch all Summer Cup Google Sheets data sources, compare columns and sample data with what is documented in docs/data-sources/, and update any files that are out of date. Use when the user asks to refresh data sources, update sheet definitions, or check if the docs match the real sheets.
tools: Read, Glob, WebFetch, Edit, Write
---

# Refresh Data Sources

Fetch every Google Sheets source used by the Summer Cup app and update the column definitions in `docs/data-sources/`.

## URLs to fetch (CSV format)

Read each `docs/data-sources/*.md` file to get the current URLs, then fetch the CSV version of each sheet.

To convert a published Google Sheets JSON URL to CSV, replace `tqx=out:json` with `output=csv`:
```
...pub?gid=XXXXX&single=true&output=csv
```
If the response is a redirect (307), follow the redirect URL.

### Sheets to refresh

| Doc file | Sheet | gid(s) |
|----------|-------|--------|
| `docs/data-sources/jogos.md` | 1ª Fase | 1352651038 |
| `docs/data-sources/jogos.md` | 2ª Fase | 797586335 |
| `docs/data-sources/equipas.md` | Equipas | 474694585 |
| `docs/data-sources/alimentacao.md` | Dia 1–5 | 1380743925, 1964067470, 2052038196, 768459128, 471658987 |
| `docs/data-sources/transportes.md` | Dia 1–5 | 654509863, 1952763025, 899121424, 206391779, 1178552434 |
| `docs/data-sources/voluntarios.md` | Voluntários | 1542074818 |

### Base URLs

- **Jogos:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vToHTnWoxtNbq9n9ADKkIknIL_LHggjewHM9d0rZ3eAMkBRuQjGwSFnRiDgXd5_SJodIHuZmlFAOmX3/pub`
- **Equipas:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vQe1DHZKEttW1Ou63N8nbT78uXj8etpoX5n8szjmtn-piG6llFqDAug83CV251JJamb_cP4g9ZP50Nq/pub`
- **Alimentação:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6Sx1XqkMAbYhjjKk5npwrXSW18z6WHGwBHjnzs9oISgFwGD5ok3YCiZPKeUfxLQOuMKvdFg5Y-06r/pub`
- **Transportes:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vSzG_9SUgTjC6k4FjydWbiTx8qtzLfUzg9-xQKK0v9oEGJu8o3OfR7ohapQVCwtCoMxTlGsj2cXO6H2/pub`
- **Voluntários:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLi7WZN5fs9qT-QCjmTzAoQb9xQYcVhCNAV9HTajproPmtNN9EML0P5wAXBM58TuY0HeF4NTAP-je/pub`

## Workflow

### Step 1 — Read current docs
Read each `docs/data-sources/*.md` to understand what columns are currently documented.

### Step 2 — Fetch sheets (sample only)
For each sheet, fetch the CSV and extract:
- Column headers (first row)
- 2–3 sample data rows

For sheets with multiple days (Alimentação, Transportes), fetch only **Dia 1** — if the structure is the same across days, no need to fetch all 5.

### Step 3 — Compare
For each sheet, compare the fetched column headers against what is documented.

Flag any differences:
- New columns not in docs
- Documented columns that no longer exist
- Column name changes (case, spacing, accents)
- Sample data that reveals the column description is wrong

### Step 4 — Update docs
For each file with differences, update the Colunas table in the corresponding `docs/data-sources/*.md` file.

- Preserve the URLs section and all other content unchanged
- Only update the Colunas table and any notes that are now inaccurate
- Add a note at the top of the Colunas section: `> Last refreshed: <today's date from context>`

### Step 5 — Report
Output a summary:
```
## Refresh Report

| Sheet | Status | Changes |
|-------|--------|---------|
| jogos (1ª Fase) | ✅ No changes | — |
| alimentacao (Dia 1) | ⚠️ Updated | Added column "X", renamed "Y" → "Z" |
...
```

If a sheet fails to fetch (network error, redirect loop), mark it as `❌ Fetch failed` and leave the doc unchanged.
