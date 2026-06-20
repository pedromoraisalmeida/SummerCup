# Data Source: Jogos

Quadro competitivo do torneio — 1ª e 2ª Fase.

---

## URLs

**1ª Fase:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vToHTnWoxtNbq9n9ADKkIknIL_LHggjewHM9d0rZ3eAMkBRuQjGwSFnRiDgXd5_SJodIHuZmlFAOmX3/pub?gid=1352651038&single=true&tqx=out:json
```

**2ª Fase:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vToHTnWoxtNbq9n9ADKkIknIL_LHggjewHM9d0rZ3eAMkBRuQjGwSFnRiDgXd5_SJodIHuZmlFAOmX3/pub?gid=797586335&single=true&tqx=out:json
```

---

## Colunas

> Last refreshed: 2026-06-20

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Jogo | Identificador único do jogo | `1` |
| Dia | Data do jogo | `09/jul.` |
| Horas | Hora de início | `14:30` |
| Escalão | Categoria (7 escalões) | `U14 F` |
| Série | Série dentro do escalão | `E` |
| C | Código do campo/pavilhão | `L4` |
| Tipo | Formato do jogo | `3 Sets` |
| Equipa A | Nome da equipa A | `CV Oeiras` |
| Equipa B | Nome da equipa B | `Lousã VC` |
| Res. A | Sets ganhos pela Equipa A | `3` |
| Res. B | Sets ganhos pela Equipa B | `0` |
| 1º Set A | Pontos da Equipa A no 1º set | `25` |
| 1º Set B | Pontos da Equipa B no 1º set | `8` |
| 2º Set A | Pontos da Equipa A no 2º set | `25` |
| 2º Set B | Pontos da Equipa B no 2º set | `13` |
| 3º Set A | Pontos da Equipa A no 3º set | `15` |
| 3º Set B | Pontos da Equipa B no 3º set | `8` |
| 4º Set A | Pontos da Equipa A no 4º set | _(vazio)_ |
| 4º Set B | Pontos da Equipa B no 4º set | _(vazio)_ |
| 5º Set A | Pontos da Equipa A no 5º set | _(vazio)_ |
| 5º Set B | Pontos da Equipa B no 5º set | _(vazio)_ |
| Approvado | Flag de aprovação do resultado | `SIM` ou _(vazio)_ |
| Arbitragem | Árbitro(s) do jogo | _(vazio ou nome)_ |

---

## Escalões Disponíveis

| Código | Descrição |
|--------|-----------|
| U14F | Sub-14 Feminino |
| U15F | Sub-15 Feminino |
| U15M | Sub-15 Masculino |
| U16F | Sub-16 Feminino |
| U17M | Sub-17 Masculino |
| U19F | Sub-19 Feminino |
| U19M | Sub-19 Masculino |

---

## Notas

- Os resultados na sheet são os resultados finais oficiais
- Os resultados em tempo real são registados no Firebase pelos Responsáveis de Pavilhão
- A app faz merge: Firebase tem prioridade sobre o resultado da sheet
