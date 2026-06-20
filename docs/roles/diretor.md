# Perfil: Diretor

**Tipo:** Autenticado por código

---

## Onboarding

1. Seleciona função: **Diretor**
2. Seleciona **clube** (lista de clubes participantes, carregada da sheet de Equipas)
3. Insere código de acesso: `SummerCup2026`

> Nota: O Diretor representa um clube com potencialmente várias equipas em diferentes escalões. Por isso seleciona clube, não escalão+equipa.

---

## Ecrãs com Acesso

### Início
- Jogos de **todas as equipas do seu clube** (todos os escalões)
- Próximos jogos e últimos resultados agregados por equipa

### Jogos
- Lista de todos os jogos do torneio
- Sem filtro preset (vê tudo, pode filtrar manualmente)

### Classificação
- Tabela de classificação por série
- Preset ao escalão das suas equipas (se clube tiver várias, mostrar a primeira ou sem preset)

### Logística → Alimentação
- Filtrada por **todas as equipas do clube**
- Agrupa por equipa e dia

### Logística → Transporte
- Filtrado por **todas as equipas do clube**
- Agrupa por equipa

### Notícias
- Notícias com audiência `jogador`, `treinador` e `diretor`

---

## Sem Acesso

- Registo de resultados

---

## Diferença vs Implementação Atual

A implementação atual trata o Diretor igual ao Treinador (seleciona escalão+equipa). A spec requer que selecione **clube** e veja informação de todas as equipas desse clube. Requer integração com a sheet de Equipas para listar clubes e as suas equipas.
