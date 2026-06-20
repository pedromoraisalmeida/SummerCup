# Data Source: Alimentação

Refeições por equipa, local e dia ao longo dos 5 dias do torneio.

---

## URLs (por dia)

Base: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6Sx1XqkMAbYhjjKk5npwrXSW18z6WHGwBHjnzs9oISgFwGD5ok3YCiZPKeUfxLQOuMKvdFg5Y-06r/pub`

| Dia | URL completa |
|-----|-------------|
| Dia 1 | `...pub?gid=1380743925&single=true&tqx=out:json` |
| Dia 2 | `...pub?gid=1964067470&single=true&tqx=out:json` |
| Dia 3 | `...pub?gid=2052038196&single=true&tqx=out:json` |
| Dia 4 | `...pub?gid=768459128&single=true&tqx=out:json` |
| Dia 5 | `...pub?gid=471658987&single=true&tqx=out:json` |

---

## Colunas

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Competição | Escalão da equipa | `U14 F` |
| Equipa | Nome da equipa | `A. Ruínas VC` |
| Local | Local/cantina onde faz a refeição | `EB2 Lousã` |
| Data | Data da refeição | `7/9/2025` |
| Refeição | Tipo de refeição | `Almoço` ou `Jantar` |

---

## Filtros por Perfil

| Perfil | Filtro aplicado |
|--------|----------------|
| Treinador | Escalão + Equipa do treinador |
| Diretor | Todas as equipas do clube do diretor |
| Pavilhão | Equipas que comem no Local associado ao seu campo |
| Jogador | Sem acesso |
| Árbitro | Sem acesso |
