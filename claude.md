# 🏐 Summer Cup 2025 — App PWA
**Lousã Volei Clube · XXIV Edição**

> App móvel oficial do Summer Cup 2025. Instalável no telemóvel como PWA (Progressive Web App) — sem App Store, sem Google Play. Partilha-se por link.

**URL da app:** https://pedromoraisalmeida.github.io/SummerCup  
**URL com patrocinadores (teste):** https://pedromoraisalmeida.github.io/SummerCup/index_pub.html

---

## 📋 Contexto para o Claude

> Cola este bloco no início de qualquer conversa nova com o Claude para continuar o trabalho sem perder contexto.

```
Estou a trabalhar numa PWA para o Summer Cup 2025 do Lousã Volei Clube.

REPOSITÓRIO: github.com/pedromoraisalmeida/SummerCup
APP ONLINE: https://pedromoraisalmeida.github.io/SummerCup

STACK TÉCNICA:
- Single HTML file (index.html) — HTML + CSS + JS
- Firebase Realtime Database para resultados em tempo real
- Google Sheets como back-office (dados lidos via JSON público)
- GitHub Pages como alojamento (gratuito)
- PWA instalável em iOS e Android

FIREBASE:
- Projeto: lvcsummercup
- Database URL: https://lvcsummercup-default-rtdb.europe-west1.firebasedatabase.app
- SDK versão: 10.12.0

DADOS CARREGADOS:
- 370 jogos da 1.ª Fase (7 escalões: U14F, U15F, U15M, U16F, U17M, U19F, U19M)
- 9 séries (A a I) por escalão
- 44 campos (L4-L8, LE1-3, S1-3, MC1-3, PO1-3, G1-3, PL1-3, UC1-6, AS1-3, ST1-3, AL1-3, CP1-3, AV1-3)
- Transportes de 200 equipas (partidas e regressos de 09/07)

PERFIS DE UTILIZADOR:
- Jogador — vê jogos da sua equipa + escalão
- Treinador — idem + transportes (código: SummerCup2026)
- Dirigente — idem + transportes (código: SummerCup2026)
- Árbitro — vê calendário geral (escala a implementar)
- Pavilhão — regista resultados set a set via Firebase

FUNCIONALIDADES IMPLEMENTADAS:
- Onboarding: função → escalão → equipa (sem série — determinada automaticamente)
- Ecrã inicial: stats + último resultado + próximo jogo + lista de jogos
- Jogos: filtro por escalão e dia
- Classificação: automática por série com pontos/vitórias/derrotas/sets
- Logística: transportes com partidas/regressos e transbordos
- Pavilhão: lista de jogos do campo + modal de registo de resultados
- Firebase: sincronização em tempo real + indicador "live"
- Dark mode: CSS forçado a branco no onboarding para compatibilidade iOS
- PWA: manifest.json + ícones (icon-192.png, icon-512.png, apple-touch-icon.png)
- QR Code: summercup_qrcode.png gerado com logo do torneio

EM FALTA (por ordem de prioridade):
1. Notificações push (VAPID Key + firebase-messaging-sw.js)
2. Painel de validação de resultados pela organização
3. Google Apps Script: Firebase → Sheet da organização
4. Sheet de árbitros + escala personalizada por código ARB-XX
5. Sheet de alimentação (cantina + horários + Maps URL)
6. Sheet de notícias/eventos
7. Transportes de 10/07 (só existe 09/07)
8. Google Analytics (Firebase já ligado, falta ativar)
9. Subdomínio summercup.lousavolleyclube.com (CNAME no DNS)
10. Patrocinadores (código testado em index_pub.html, aguarda decisão)

FICHEIROS NO REPOSITÓRIO:
- index.html — app principal
- index_pub.html — versão com patrocinadores (teste)
- manifest.json — configuração PWA
- icon-192.png — ícone Android
- icon-512.png — ícone splash screen
- apple-touch-icon.png — ícone iPhone
- summercup_qrcode.png — QR Code da app
- docs/ — documentação e specs da app (https://pedromoraisalmeida.github.io/SummerCup/docs/)
- README.md — este ficheiro
```

---

## 🗂 Estrutura do Projeto

```
SummerCup/
├── index.html              # App principal
├── index_pub.html          # Versão com patrocinadores (teste)
├── manifest.json           # Configuração PWA
├── icon-192.png            # Ícone Android
├── icon-512.png            # Ícone splash screen
├── apple-touch-icon.png    # Ícone iPhone
├── summercup_qrcode.png    # QR Code da app
├── docs/                   # Documentação e specs da app
│   └── index.html
└── README.md               # Este ficheiro
```

---

## 🏗 Arquitetura

```
Google Sheets          Firebase               GitHub Pages
─────────────          ────────────           ─────────────
Quadro competitivo     Resultados             Aloja o HTML
Transportes       ←→  em tempo real    ←→    (index.html)
Árbitros               Notificações
Alimentação            push
Notícias
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
