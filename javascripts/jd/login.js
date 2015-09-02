var task = null;
var settings = null;
var init = new Init();
var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true };
messageListener();
init.sendMessage('settings');
setTimeout(function() {
    init.sendMessage('task');
},1000);

function messageListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message.cmd === 'task'){
            task = message.task;
            console.log(task);
        }
        if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
        }
        if(task && settings){
            if(!task.password){

            }else{
                login();
            }
        }
    });
}

function login(){
    var $loginname = $('#loginname');
    var $loginpwd = $('#nloginpwd');
    var $loginsubmit = $('#loginsubmit');
    //var $authcode = $('#autocode');
    if($loginname.length > 0 && $loginpwd.length > 0 && $loginsubmit.length > 0){
        $loginname.val(task.username);
        setTimeout(function(){
            $loginpwd.val(task.password);
            setTimeout(function() {
                chrome.extension.sendMessage({cmd: 'watchdog'});
                $loginsubmit[0].click();
            }, 3000);
        },3000);
    }else{
        console.log("页面无 登陆 用户框 密码框 //刷新页面");
        setTimeout(function(){
            chrome.extension.sendMessage({cmd: 'watchdog'});
            window.location.reload(true);
        },3000);
    }
}

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(settings.running){
            if(mutation.type === 'childList'){

                if(mutation.addedNodes.length > 0 && mutation.target.className == 'msg-wrap'){
                    console.log(mutation);
                    if(mutation.target.innerText.indexOf('账户名不存在，请重新输入') != -1){
                        console.log(mutation.target.innerText);
                        chrome.extension.sendMessage({cmd: 'reset_account',message: mutation.target.innerText});
                    }
                    if(mutation.target.innerText.indexOf('账户名与密码不匹配，请重新输入') != -1){
                        console.log(mutation.target.innerText);
                        chrome.extension.sendMessage({cmd: 'reset_account',message: mutation.target.innerText});
                    }
                    if(mutation.target.innerText.indexOf('公共场所不建议自动登录，以防账号丢失') != -1){
                        console.log(mutation.target.innerText);
                    }
                    if(mutation.target.innerText.indexOf('请输入验证码') != -1){
                        console.log(mutation.target.innerText);
                    }
                    if(mutation.target.innerText.indexOf('你的账号因安全原因被暂时封锁，请将账号和联系方式发送到shensu@jd.com，等待处理') != -1){
                        console.log(mutation.target.innerText);
                        chrome.extension.sendMessage({cmd: 'reset_account',message: mutation.target.innerText});
                    }
                }
            }
            if(mutation.type === 'attributes'){

            }
        }
    });
});

observer.observe(document.body, config);
