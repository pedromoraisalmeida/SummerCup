// Service Worker — Summer Cup 2026
// Estratégia: "rede primeiro" para tudo. Só usa a cache como reserva quando
// não há rede (offline). Isto evita ficar preso em versões antigas: cada
// pedido tenta sempre ir buscar a versão mais recente ao servidor primeiro.
const CACHE_NAME = 'summercup-v1';

// O browser só deteta um Service Worker "novo" comparando este ficheiro
// byte a byte com o que já tem instalado — se só mudarem outros ficheiros
// da app (HTML/CSS/JS), este ficheiro fica igual e não há update a
// detetar. Por isso, esta versão é incrementada manualmente a cada
// commit/push, só para forçar o browser a ver sempre um sw.js "diferente"
// e mostrar o aviso de "nova versão disponível" a quem já tem a app aberta.
const SW_VERSION = 12;

self.addEventListener('install', () => {
  // Não espera pelos separadores antigos fecharem — assume o controlo assim
  // que estiver pronto.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Só aplica a estratégia de cache aos ficheiros do próprio site (HTML/CSS/JS/
  // logos/ícones). Pedidos a outros domínios (Google Sheets, Firebase) passam
  // sempre diretos à rede, sem cache nem fallback offline — os dados do
  // torneio nunca devem ser servidos como "atuais" quando na verdade são de
  // uma sessão anterior.
  if (new URL(event.request.url).origin !== self.location.origin) return;

  // cache:'no-store' ignora a cache HTTP normal do browser (que o GitHub
  // Pages define com Cache-Control: max-age=600) — sem isto, a "rede
  // primeiro" podia devolver uma resposta HTTP cacheada de até 10 minutos
  // atrás em vez de ir mesmo ao servidor, atrasando a chegada de updates.
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
