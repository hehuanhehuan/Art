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
            orderSuccess();
        }
        else if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
            init.sendMessage('task');
        }
    });
}


function orderSuccess(){
    var order_id = $('#successOrderId').val();
    if(order_id){
        chrome.extension.sendMessage({cmd: 'order_success',order_id: order_id});
    }else{

    }
}
