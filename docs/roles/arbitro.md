# Perfil: Árbitro

**Tipo:** Autenticado por código ARB-XX

---

## Onboarding

1. Seleciona função: **Árbitro**
2. Insere código árbitro (ex: `ARB-07`)
3. Código é validado contra a sheet de Voluntários

---

## Ecrãs com Acesso

### Início
- Jogos onde está **alocado como árbitro**
- Filtrado pelo campo/pavilhão da sua alocação na sheet de Voluntários

### Jogos
- Lista de todos os jogos do torneio
- Pode filtrar por escalão e dia

### Classificação
- Tabela de classificação por série
- Pode navegar por escalões e séries

### Notícias
- Notícias com audiência `jogador` e `arbitro`

---

## Sem Acesso

- Logística (Alimentação e Transporte)
- Registo de resultados

---

## Correspondência Código → Sheet de Voluntários

A sheet de Voluntários tem coluna "Grupo" (ex: "Arbitragem 1", "Arbitragem 7") mas não tem coluna ARB-XX explícita. A correspondência deve ser: `ARB-07` → `Arbitragem 7` (extrai o número do código e faz match com o número no nome do grupo).
