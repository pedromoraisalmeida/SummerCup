# Summer Cup 2025 — Documentação da App

App PWA oficial do Summer Cup 2025, Lousã Volei Clube.

**App:** https://pedromoraisalmeida.github.io/SummerCup  
**Repositório:** https://github.com/pedromoraisalmeida/SummerCup

---

## Perfis de Utilizador

| Perfil | Autenticação | Documento |
|--------|-------------|-----------|
| Jogador | Público (sem código) | [jogador.md](roles/jogador.md) |
| Treinador | Código `SummerCup2026` | [treinador.md](roles/treinador.md) |
| Diretor | Código `SummerCup2026` | [diretor.md](roles/diretor.md) |
| Árbitro | Código `ARB-XX` | [arbitro.md](roles/arbitro.md) |
| Responsável de Pavilhão | Código `PAV-XX` | [pavilhao.md](roles/pavilhao.md) |

---

## Fontes de Dados (Google Sheets)

| Sheet | Descrição | Documento |
|-------|-----------|-----------|
| Jogos | Quadro competitivo 1ª e 2ª Fase | [jogos.md](data-sources/jogos.md) |
| Equipas | Equipas, clubes e alojamento | [equipas.md](data-sources/equipas.md) |
| Alimentação | Refeições por equipa e dia (5 dias) | [alimentacao.md](data-sources/alimentacao.md) |
| Transportes | Partidas e regressos por dia (5 dias) | [transportes.md](data-sources/transportes.md) |
| Voluntários | Árbitros e medical staff | [voluntarios.md](data-sources/voluntarios.md) |

---

## Acesso por Funcionalidade

| Funcionalidade | Jogador | Treinador | Diretor | Árbitro | Pavilhão |
|----------------|:-------:|:---------:|:-------:|:-------:|:--------:|
| Início (jogos próprios) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jogos (todos) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Classificação | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logística → Alimentação | ❌ | ✅ | ✅ | ❌ | ✅ |
| Logística → Transporte | ❌ | ✅ | ✅ | ❌ | ✅ |
| Registo de Resultados | ❌ | ❌ | ❌ | ❌ | ✅ |
| Notícias | jogador | jogador + treinador | jogador + treinador + diretor | jogador + arbitro | jogador + arbitro |
