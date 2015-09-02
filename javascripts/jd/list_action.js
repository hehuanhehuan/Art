var init = new Init();
var task = null;
var settings = null;
messageListener();
setTimeout(function(){
    init.sendMessage('cookies');
},3000);

function messageListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message.cmd === 'cookies'){
            init.sendMessage('settings');
        }
        else if(message.cmd === 'task'){
            task = message.task;
            console.log(task);
            goAddress();
        }
        else if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
            init.sendMessage('task');
        }
    });
}

function goAddress(){
    var address = $('#_MYJD_add').find('a');
    if(address.length > 0){
        address[0].click();
    }else{
        window.open('http://easybuy.jd.com/address/getEasyBuyList.action');
    }
}


