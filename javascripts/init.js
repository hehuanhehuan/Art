function Init() {
  chrome.extension.sendMessage({cmd: 'watchdog'});
}

Init.prototype = {
  watchDog: function() {
    chrome.extension.sendMessage({cmd: 'watchdog'});
  },

  rands: function(min, max){
    var str_radom = 0;
    do{
      str_radom = Math.floor(Math.random() * max) + min;
    }while(!(str_radom >= min && str_radom <= max));

    return str_radom;
  },

  sendMessage: function(type){
    chrome.extension.sendMessage({cmd: type});
  },

  accountDisable: function(callback){
    callback && callback();
  },


  listAction: function(callback) {
    callback && callback();
  },

  itemProduct: function(callback){
    callback && callback();
  },

  addCart: function(){
    var go_to_shopping_cart = $('#GotoShoppingCart');
    if(go_to_shopping_cart.length > 0){
      go_to_shopping_cart[0].click();
    }else{
      window.location.href = 'http://cart.jd.com/cart';
    }
  },

  cart: function(callback){
    callback && callback();
  },

  orderInfo: function(callback){
    callback && callback();
  }

};