var init = new Init();

var go_cart = $('#GotoShoppingCart');
if(go_cart.length > 0){
    setTimeout(function(){
        init.watchDog();
        go_cart[0].click();
    },4000);
}else{
    setTimeout(function(){
        init.watchDog();
        window.open('http://cart.jd.com/cart');
    },4000);
}