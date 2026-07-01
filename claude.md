# 🏐 Summer Cup 2026 — App PWA
**Lousã Volei Clube · XXV Edição**

> App móvel oficial do Summer Cup 2026. Instalável no telemóvel como PWA (Progressive Web App) — sem App Store, sem Google Play. Partilha-se por link.

**URL da app:** https://pedromoraisalmeida.github.io/SummerCup  
**Versão com patrocinadores (arquivada, não publicada):** `archive/index_pub.html`

---

## 📋 Contexto para o Claude

> Cola este bloco no início de qualquer conversa nova com o Claude para continuar o trabalho sem perder contexto.

```
Estou a trabalhar numa PWA para o Summer Cup 2026 do Lousã Volei Clube.

REPOSITÓRIO: github.com/pedromoraisalmeida/SummerCup
APP ONLINE: https://pedromoraisalmeida.github.io/SummerCup

STACK TÉCNICA:
- App modular: index.html (markup) + styles.css + js/ (módulos ES6)
- Firebase Realtime Database para resultados em tempo real
- Google Sheets como back-office (dados lidos via CSV público)
- GitHub Pages como alojamento (gratuito)
- PWA instalável em iOS e Android

FIREBASE:
- Projeto: lvcsummercup
- Database URL: https://lvcsummercup-default-rtdb.europe-west1.firebasedatabase.app
- SDK versão: 10.12.0

DADOS CARREGADOS (via Google Sheets, CSV):
- Jogos (1.ª e 2.ª Fase), 7 escalões: U14F, U15F, U15M, U16F, U17M, U19F, U19M
- Equipas — derivadas automaticamente dos jogos
- Transportes — 5 dias, partidas/regressos com transbordos
- Alimentação — 5 dias, por equipa/campo

PERFIS DE UTILIZADOR (onboarding próprio para cada um):
- Jogador — vê jogos da sua equipa + escalão (sem código)
- Treinador — idem + transportes/alimentação (código: SummerCup2026)
- Dirigente — idem + transportes/alimentação (código: SummerCup2026)
- Árbitro — autenticado por código ARB-XX
- Pavilhão — autenticado por código PAV-XX (44 campos), regista resultados set a set via Firebase

FUNCIONALIDADES IMPLEMENTADAS:
- Onboarding: função → equipa/código → confirmação (série determinada automaticamente)
- Ecrã inicial, Jogos (filtro por escalão/dia), Classificação automática por série
- Logística: transportes e alimentação (filtrados por perfil/campo)
- Pavilhão: lista de jogos do campo + modal de registo de resultados set a set
- Firebase: sincronização em tempo real + indicador "live" (merge com dados do Sheet)
- PWA: manifest.json + ícones (icon-192.png, icon-512.png, apple-touch-icon.png)

EM FALTA (por ordem de prioridade):
1. Notificações push (VAPID Key + firebase-messaging-sw.js)
2. Painel de validação de resultados pela organização
3. Google Apps Script: Firebase → Sheet da organização
4. Sheet de notícias/eventos
5. Transportes/Alimentação dos restantes dias (ver docs/data-sources/)
6. Google Analytics (Firebase já ligado, falta ativar)
7. Subdomínio summercup.lousavolleyclube.com (CNAME no DNS)
8. Patrocinadores (versão de teste arquivada em archive/index_pub.html, aguarda decisão)

FICHEIROS NO REPOSITÓRIO:
- index.html — markup da app
- styles.css — estilos
- js/ — módulos ES6 (config, state, data, firebase, onboarding, shell, utils, roles/)
- manifest.json — configuração PWA
- icon-192.png, icon-512.png, apple-touch-icon.png — ícones PWA
- archive/index_pub.html — versão de teste com patrocinadores (não publicada)
- docs/ — documentação e specs da app (perfis em docs/roles/, fontes de dados em docs/data-sources/)
- README.md — este ficheiro
```

---

## 🗂 Estrutura do Projeto

```
SummerCup/
├── index.html                  # Markup da app
├── styles.css                  # Estilos
├── js/                         # Módulos ES6
│   ├── app.js                  # Entrypoint
│   ├── config.js                # Firebase config, URLs dos Sheets, códigos de campo
│   ├── state.js                 # Estado partilhado em memória
│   ├── data.js                  # Parser CSV + carregamento dos Sheets
│   ├── firebase.js              # Sync com Firebase Realtime Database
│   ├── onboarding.js            # Fluxo de onboarding (5 perfis)
│   ├── shell.js                 # Navegação, painel de perfil
│   ├── utils.js                 # Helpers (formatação de jogos/equipas)
│   └── roles/                   # Lógica específica por perfil (jogador, arbitro, pavilhao, logistica, shared)
├── manifest.json                # Configuração PWA
├── icon-192.png, icon-512.png, apple-touch-icon.png
├── archive/
│   └── index_pub.html          # Versão de teste com patrocinadores (não publicada)
├── docs/                        # Documentação e specs da app
│   ├── index.md
│   ├── roles/                   # Spec de comportamento por perfil
│   └── data-sources/            # Colunas/URLs de cada Google Sheet
└── README.md
```

---

## 🏗 Arquitetura

```
Google Sheets          Firebase               GitHub Pages
─────────────          ────────────           ─────────────
Jogos, Equipas         Resultados             Aloja a app
Transportes       ←→  em tempo real    ←→    (index.html + styles.css + js/)
Alimentação             Notificações
                        push
```

---

## 📊 Google Sheets — Estrutura

Cada Sheet deve ser publicado como JSON:
**Ficheiro → Partilhar e exportar → Publicar na web**

### Sheet 1 — Quadro Competitivo ✅ Pronto
| Jogo | Dia | Hora | Escalão | Série | Campo | Equipa A | Equipa B | Resultado | Sets |

### Sheet 2 — Transportes ✅ 09/Jul pronto
| Escalão | Equipa | Origem 1 | Destino 1 | Hora 1 | Origem 2 | Destino 2 | Hora 2 |

### Sheet 3 — Árbitros ⏳ A criar
| Jogo | Dia | Hora | Campo | Escalão | Equipa A | Equipa B | Árbitro 1 | Código ARB1 | Árbitro 2 | Código ARB2 |

### Sheet 4 — Alimentação ⏳ A criar
| Escalão | Equipa | Cantina | Morada | Maps URL | Horário Almoço | Horário Jantar |

### Sheet 5 — Notícias ⏳ A criar
| Título | Texto | Foto URL | Data | Hora | Local | Maps URL |

### Sheet 6 — Equipas ⏳ A criar
| Equipa | Clube | Escalão | Série | Treinador | País |

### Sheet 7 — Patrocinadores ⏳ A criar (quando houver)
| posicao | nome | slogan | logo_url | site_url | secao |

---

## 🔑 Credenciais e Acessos

| Serviço | Detalhe |
|---------|---------|
| GitHub | github.com/pedromoraisalmeida/SummerCup |
| Firebase projeto | lvcsummercup |
| Firebase console | console.firebase.google.com |
| Código transportes | SummerCup2026 |
| App URL | https://pedromoraisalmeida.github.io/SummerCup |
| Domínio futuro | summercup.lousavolleyclube.com |

---

## ✅ Estado Atual

### Implementado
- [x] PWA instalável em iOS e Android
- [x] 370 jogos da 1.ª Fase carregados
- [x] 7 escalões e 9 séries
- [x] Transportes 09/Jul (200 equipas)
- [x] 5 perfis de utilizador com onboarding
- [x] Resultados em tempo real via Firebase
- [x] Classificações automáticas
- [x] Registo de resultados pelos pavilhões
- [x] Dark mode corrigido para iPhone
- [x] QR Code gerado
- [x] Logo e cores do Summer Cup integradas

### Em curso
- [ ] Notificações push
- [ ] Painel de validação de resultados
- [ ] Google Apps Script (Firebase → Sheet)
- [ ] Sheet de árbitros
- [ ] Sheet de alimentação
- [ ] Sheet de notícias
- [ ] Transportes 10/Jul
- [ ] Subdomínio lousavolleyclube.com
- [ ] Google Analytics

---

## 📱 Como instalar a app

**Android (Chrome):**
1. Abre https://pedromoraisalmeida.github.io/SummerCup no Chrome
2. Menu (3 pontos) → Adicionar ao ecrã inicial

**iPhone (Safari):**
1. Abre https://pedromoraisalmeida.github.io/SummerCup no Safari
2. Botão de partilha → Adicionar ao ecrã de início

---

## 🚀 Como atualizar a app

1. Gera o novo `index.html` com o Claude
2. No GitHub: **Add file → Upload files**
3. Arrasta o ficheiro e faz **Commit changes**
4. A app atualiza automaticamente em 1-2 minutos

---

*Projeto desenvolvido com Claude (Anthropic) · Lousã Volei Clube 2026*
