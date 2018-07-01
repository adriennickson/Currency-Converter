import idb from 'idb';
var $ = require("jquery");

// initialise and set table of database
const dbPromise = idb.open('database', 1, upgradeDB => {
  upgradeDB.createObjectStore('currency');
  upgradeDB.createObjectStore('rate',{ keyPath: "couple" });
});

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

// set curency in selects
fetch("https://free.currencyconverterapi.com/api/v5/currencies")
.then(function(response){
  response.json().then(function(data){

    idb.open("database").then(db => {
      const tx = db.transaction('currency', 'readwrite');
      let store = tx.objectStore("currency");
      for (var key in data.results) {
        store.put(data.results[key], key);
      }  
      return tx.complete;
    });

    $.each(data.results, function(k, v) {
      $("select[name|='from']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
      $("select[name|='to']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
    });

  })
})
.catch(function(){
    // idb
    idb.open("database").then(db => {
      return db.transaction('currency').objectStore('currency').getAll();
    }).then(allCurrencies => {
      let dbData = {}
      for (var key in allCurrencies) {
        // console.log(key + ' --> ' +data.results[key]);
        dbData[allCurrencies[key].id] = {
          "currencyName" : allCurrencies[key].currencyName,
          "currencySymbol" : allCurrencies[key].currencySymbol,
          "id" : allCurrencies[key].id
        } ;
      }                
      $.each(dbData, function(k, v) {
        $("select[name|='from']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
        $("select[name|='to']").append(`<option value="${k}">${v.currencyName} - (${k})</option>`);
      });
    });

})

// try to get responce of form
$("#btn-evaluer").click(function(){
  $("#loader-container").toggleClass('hide')
  let from = $("select[name|='from']").val();
  let to = $("select[name|='to']").val();
  let couple = from+'_'+to;
  fetch('https://free.currencyconverterapi.com/api/v5/convert?q='+couple+'&compact=y')
  .then(function(responce){
    responce.json().then(function(data){
      resulta(from, to, $("#amount").val()?$("#amount").val():1, data[couple]['val'])
      idb.open("database").then(db => {
        const tx = db.transaction('rate', 'readwrite');
        let store = tx.objectStore("rate");
        store.put({couple:couple, value : data[couple]});
        return tx.complete;
      });
    })
  })
  .catch(function(){
    idb.open("database").then(db => {
      return db.transaction('rate').objectStore('rate').get(couple);
    }).then(data => {
      resulta(from, to, $("#amount").val()?$("#amount").val():1, data['value']['val'])
    }).catch(function(){
      $("#loader-container").toggleClass('hide')
      $("#result").text('offline && !inDatabase');      
    })
  })
  return false;
})

// triger click if form is submit using enter key
function evaluer(){
  $("#btn-evaluer").trigger( "click" );
  return false;
}

// print rate
function resulta(from, to, unit, rate){
  $("#loader-container").toggleClass('hide')
  let toPrint = `${unit} ${from} = ${unit*rate} ${to}`;
  $("#result").text(toPrint);
}