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
            codPayment();
        }
        else if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
            init.sendMessage('task');
        }
    });
}

function codPayment(){
    var payment_list = $('.payment-list');
    if(payment_list.length > 0){
        console.log(payment_list);
        var payment_cod = payment_list.find('li:contains("货到付款")');
        if(payment_cod.length > 0){
            console.log(payment_cod);
            var payment_cod_selected = payment_cod.find('div.item-selected[payname="货到付款"]');
            if(payment_cod_selected.length > 0){
                console.log(payment_cod_selected);
                orderRemark();
            }else{
                payment_cod[0].click();
                setTimeout(function(){
                    init.watchDog();
                    window.location.reload(true);
                },3000);
            }
        }else{

        }
    }else{

    }
}

function orderRemark(){
    var remark_text = $('#remarkText');
    if(remark_text.length > 0){
        var remark = remark_text[0].value;
        if(task.order_remark){
            if(remark == task.order_remark){
                orderSubmit();
            }else{
                $('#remarkText').val(task.order_remark);
                setTimeout(function () {
                    init.watchDog();
                    orderRemark();
                },2000);
            }
        }else{
            orderSubmit();
        }
    }else{
        orderSubmit();
    }
}

function orderSubmit(){
    var order_submit = $('#order-submit');
    if(order_submit.length > 0){
        order_submit[0].click();
    }else{

    }
}
