// register service worker

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(reg) {
      // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope);
  
      if(reg.installing) {
        console.log('Service worker installing');
      } else if(reg.waiting) {
        console.log('Service worker installed');
      } else if(reg.active) {
        console.log('Service worker active');
      }
  
    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });
  }
  
  $( document ).ready(function() {
  
    $.get( "https://free.currencyconverterapi.com/api/v5/currencies", function( response ) {
      $.each(response.results, function(k, v) {
        $("select[name|='from']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
        $("select[name|='to']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
      });
    });
    
  });