# Perfil: Responsável de Pavilhão

**Tipo:** Autenticado por código PAV-XX

---

## Onboarding

1. Seleciona função: **Pavilhão**
2. Insere código pavilhão (ex: `PAV-L4`)
3. Código é validado contra a lista de campos (44 campos: L4-L8, LE1-3, S1-3, MC1-3, PO1-3, G1-3, PL1-3, UC1-6, AS1-3, ST1-3, AL1-3, CP1-3, AV1-3)

---

## Ecrãs com Acesso

### Início
- Lista de jogos **do seu campo/pavilhão** (filtrado por campo)
- Estado de cada jogo (por jogar / com resultado)

### Jogos
- Lista de todos os jogos do torneio
- Pode filtrar por escalão e dia

### Classificação
- Tabela de classificação por série
- Pode navegar por escalões e séries

### Logística → Alimentação
- Filtrada para **o seu pavilhão** (campo)
- Mostra equipas que comem no local, horários e refeições

### Logística → Transporte
- Filtrado para **o seu pavilhão**
- Mostra transportes de/para o campo

### Notícias
- Notícias com audiência `jogador` e `arbitro`

---

## Funcionalidade Exclusiva: Registo de Resultados

- Modal de registo de resultados set a set
- Clicar num jogo abre o modal
- Inserir pontuação de cada set (mínimo 2 sets, best-of-3)
- Resultado submetido ao Firebase em tempo real
- Todos os utilizadores veem o resultado atualizado com indicador "live"

---

## Diferença vs Implementação Atual

A implementação atual não mostra Logística ao Pavilhão. A spec adiciona **Alimentação e Transporte filtrados pelo campo** do responsável.
