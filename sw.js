// Tutto in cache alla prima apertura: al supermercato la lista funziona anche senza campo.
const CACHE = 'spesa-burger-v4';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
const ICONS = ['Cut of meat', 'Bacon', 'Cheese wedge', 'Glass of milk', 'Butter', 'Egg', 'Bread', 'Bubbles', 'Salt',
  'Seedling', 'Jar', 'Tomato', 'Hot dog', 'Cucumber', 'Hot pepper', 'Olive', 'Test tube', 'Onion', 'Potato', 'Herb', 'Garlic', 'Shopping cart', 'Hamburger']
  .map(n => 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/'
    + encodeURIComponent(n) + '/3D/' + n.toLowerCase().replace(/ /g, '_') + '_3d.png');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(CORE);
    await Promise.all(ICONS.map(u => fetch(u, { mode: 'no-cors' }).then(r => c.put(u, r)).catch(() => {})));
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(res => {
        if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
