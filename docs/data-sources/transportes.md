# Data Source: Transportes

Partidas e regressos das equipas ao longo dos 5 dias do torneio.

---

## URLs (por dia)

Base: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSzG_9SUgTjC6k4FjydWbiTx8qtzLfUzg9-xQKK0v9oEGJu8o3OfR7ohapQVCwtCoMxTlGsj2cXO6H2/pub`

| Dia | URL completa |
|-----|-------------|
| Dia 1 | `...pub?gid=654509863&single=true&tqx=out:json` |
| Dia 2 | `...pub?gid=1952763025&single=true&tqx=out:json` |
| Dia 3 | `...pub?gid=899121424&single=true&tqx=out:json` |
| Dia 4 | `...pub?gid=206391779&single=true&tqx=out:json` |
| Dia 5 | `...pub?gid=1178552434&single=true&tqx=out:json` |

---

## Colunas

> Last refreshed: 2026-06-20

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Data | Data da viagem | `9-Jul-2025` |
| Competição | Categoria da equipa | `U14 F` |
| Equipa | Nome da equipa | `A. Ruínas VC` |
| Origem | Ponto de partida | `Penela` |
| Destino | Destino da viagem | `Lousã (LTP)` |
| Hora | Hora da viagem | `10:15` |
| Origem2 | Ponto de partida da 2ª etapa (transbordo) | _(vazio se não houver)_ |
| Destino2 | Destino da 2ª etapa | _(vazio se não houver)_ |
| Hora2 | Hora da 2ª etapa | _(vazio se não houver)_ |

---

## Filtros por Perfil

| Perfil | Filtro aplicado |
|--------|----------------|
| Treinador | Escalão + Equipa do treinador |
| Diretor | Todas as equipas do clube do diretor |
| Pavilhão | Equipas com Origem ou Destino no seu campo |
| Jogador | Sem acesso |
| Árbitro | Sem acesso |

---

## Notas

- Cada linha representa **uma viagem** (ida OU regresso) de uma equipa — uma equipa tem normalmente 2 linhas por dia
- `Origem2`/`Destino2`/`Hora2` são usados para transbordos (2ª etapa da mesma viagem)
- Dia 1 de 09/07/2025 está implementado; dias seguintes precisam de validação
