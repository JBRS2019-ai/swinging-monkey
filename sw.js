const CACHE='monkey-v1';
const FILES=[
  './',
  './microbit_controller_custom.html',
  './microbit_uart_ble.js',
  './functions.js',
  './manifest.webmanifest',
  './icons/monkey-192.png',
  './icons/monkey-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
