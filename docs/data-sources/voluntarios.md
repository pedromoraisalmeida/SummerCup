# Data Source: Voluntários

Árbitros e medical staff — grupos, locais de trabalho e logística.

---

## URL

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLi7WZN5fs9qT-QCjmTzAoQb9xQYcVhCNAV9HTajproPmtNN9EML0P5wAXBM58TuY0HeF4NTAP-je/pub?gid=1542074818&single=true&tqx=out:json
```

---

## Colunas

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Grupo | Identificador do grupo | `Arbitragem 1`, `Medical Staff 2` |
| Local de Jogos | Pavilhão/campo onde trabalha | `Serpins` |
| Local Alimentação | Onde faz as refeições | `Serpins` |
| Hora de Sáida | Hora de partida da manhã | `8:00` |
| Local de Saída | Ponto de partida | `Lousã - EB1` |
| Dia | Data | `7/9/2025` |

---

## Grupos Disponíveis

- **Arbitragem** — árbitros de voleibol
- **Medical Staff** — equipa médica e de apoio

---

## Correspondência Código ARB-XX → Grupo

A sheet usa "Grupo" (ex: `Arbitragem 7`) sem coluna de código ARB-XX.  
A app usa código `ARB-07` no onboarding do Árbitro.

**Regra de correspondência:** extrair o número do código e fazer match com o número no nome do grupo:
- `ARB-01` → `Arbitragem 1`
- `ARB-07` → `Arbitragem 7`

**Uso na app:** Árbitro introduz `ARB-07` → app carrega a linha `Arbitragem 7` para saber o seu campo e refeições.
