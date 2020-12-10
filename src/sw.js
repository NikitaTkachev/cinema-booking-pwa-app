importScripts('workbox-v4.3.1/workbox-sw.js');

const { precacheAndRoute } = workbox.precaching;
const { BackgroundSyncPlugin, Queue } = workbox.backgroundSync;


self.addEventListener('message', ({ data }) => {
  if (data === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', () => {
  clients.claim();
});



const queue = new Queue('seat-booking-queue', {
  onSync: async ({queue}) => {
    let entry;
    while (entry = await queue.shiftRequest()) {
      try {
        const response = await fetch(entry.request);
        const data = await response.json();

        const clients = await self.clients.matchAll({type: 'window'});
        for (const client of clients) {
          client.postMessage({
            ok: response.ok,
            data: data,
          });
        }
      } catch (error) {
        // Put the entry back in the queue and re-throw the error:
        await this.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

self.addEventListener('fetch', event => {
  // Clone the request to ensure it's safe to read when
  // adding to the Queue
  const promiseChain = fetch(event.request.clone())
    .catch(err => {
      // Add to Queue only booking requests
      if (event.request.url.startsWith('https://cinema-booking-pwa-app.herokuapp.com/seats/book/')) {
        return queue.pushRequest({
          request: event.request,
        });
      }
    });
  
  event.waitUntil(promiseChain);
});

precacheAndRoute([]);
