// Silk Mart Service Worker - Required for PWA installability
const CACHE_NAME = 'silkmart-v1'
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/badge-72.png',
  '/logo.png'
]

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API/auth requests
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge-72.png',
      tag: data.tag || 'silkmart-notification',
      data: data.data,
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Silk Mart', options)
    )
  } catch (error) {
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Silk Mart', {
        body: event.data.text(),
        icon: '/icon-192.png',
        badge: '/badge-72.png',
      })
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
