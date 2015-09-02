var init = new Init();
setTimeout(function(){
	init.watchDog();
	init.accountDisable(function(){
		chrome.extension.sendMessage({cmd: 'reset_account',message: '登录手机短信重置密码'});
	});
},3000);