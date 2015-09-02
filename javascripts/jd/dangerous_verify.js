var message = $('.tip-box').html();
//因您的账户存在风险，需进一步校验您的信息以提升您的安全等级
if(message){
	var init = new Init();
	setTimeout(function(){
		init.watchDog();
		init.accountDisable(function(){
			chrome.extension.sendMessage({cmd: 'reset_account',message: message});
		});
	},3000);
}else{
	window.location.reload(true);
}