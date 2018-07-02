self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('site-v1').then(function(cache) {
      return cache.addAll([
        '/Currency-Converter/',
        '/Currency-Converter/index.html',
        '/Currency-Converter/style.css',
        '/Currency-Converter/app.js',
        '/Currency-Converter/logo.png',
        '/Currency-Converter/logo.jpg',
        '/',
        '/index.html',
        '/style.css',
        '/app.js',
        '/logo.png',
        '/logo.jpg',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
        'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.url.startsWith('https://free.currencyconverterapi.com/')) {
    event.respondWith(
      fetch(event.request).catch(function(){
        var errorResponse = Response.error();
        return errorResponse;
      })
    )
  }else{
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        if (response !== undefined) {
          return response;
        } else {
          return fetch(event.request).then(function (response) {
            let responseClone = response.clone();
            caches.open('api-v1').then(function (cache) {
              cache.put(event.request, responseClone);
            });
            return response;
          }).catch(function () {
            var errorResponse = Response.error();
            return errorResponse;
          });
        }
      }).catch(function(){
        return fetch(event.request);
      })
    );  
  }
});
