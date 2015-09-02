var init = new Init();
var task = null;
var settings = null;
messageListener();
setTimeout(function(){
    init.sendMessage('settings');
},3000);

function messageListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message.cmd === 'task'){
            task = message.task;
            console.log(task);
        }
        else if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
            init.sendMessage('task');
        }
        if(task && settings){
            addCart();
        }
    });
}

function addCart(){
    var buy_num = $('#buy-num');
    if(buy_num.length > 0){
        console.log(buy_num);
        if(buy_num[0].value == 1){
            var cart_url = $('#InitCartUrl');
            if(cart_url.length > 0){
                cart_url[0].click();
            }else{

            }
        }else{
            buy_num[0].value = 1;
        }
    }else{

    }
}

function checkCod(){
    //支持货到付款
    if($('a:contains("货到付款")').length > 0){
        console.log($('a:contains("货到付款")'));
        checkItem();
    }else{
        //不支持货到付款
    }
}

function checkStore(){
    //，此商品暂时售完
    addCart();
}

function checkItem(){
    //该商品已下柜，非常抱歉！

    checkStore();
}
