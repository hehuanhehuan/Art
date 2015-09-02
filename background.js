var last_watchdog_time = new Date().getTime();
var start_time = null;

var last_ip = null;
var api = null;
var task = {};
var ip_get_count = 0;
var boot_page = {
  jd: 'http://order.jd.com/center/list.action',
  yhd: 'http://my.yhd.com/order/myOrder.do'
};
var settings = {};

messageListener();
reloadSettings(function(){
  console.log('reloadSettings finish');
  setTimeout(watchdog, 1000);
});

function getTask(callback) {
  api.getTask(function(data) {
    console.log(data);
    if (data.success == 1) {
      chrome.storage.local.set({task: data.data}, function() {
        start_time = new Date().getTime();
        task = data.data;
        console.log(task);
        callback && callback();
      });
    } else {
      start_time = null;
      setTimeout(function(){
        last_watchdog_time = new Date().getTime();
        getTask(callback);
      }, 20000);
    }
  }, function() {
    console.log('接口请求失败');
    start_time = null;
    setTimeout(function(){changeIpAndOpenWindow()}, 30000);
  });
}

function changeIpAndOpenWindow() {
  last_watchdog_time = new Date().getTime();

  closeAllWindows(function() {
    setTimeout(function() {
      chrome.windows.create({
        url: 'adsl:adsl'
      }, function(window) {
        setTimeout(openWindow, 8000);
      });
    }, 1000);
  });
}

function openWindow() {

  last_watchdog_time = new Date().getTime();

  $.ajax({url: 'http://b1.poptop.cc/remote_addr?'+new Date().getTime(), timeout: 3000}).done(function(data) {

    ip_get_count = 0;
    if (isValidIpv4Addr(data)) {
      if (data == last_ip) {
        console.log('当前IP和最后使用IP一样，重新执行更换IP');
        setTimeout(changeIpAndOpenWindow, 20000);
      } else {
        last_ip = data;
        getTask(function() {
          closeAllWindows(function() {
            setTimeout(function() {
              setCookies(function(){
                setTimeout(function(){
                  chrome.tabs.create({url: boot_page[task.slug]}, function(){

                  });
                },3000);
              });
            }, 10000);
          });
        });
      }
    }

  }).fail(function(){
    if(ip_get_count > 3 ){
      setTimeout(function(){
        ip_get_count = 0;
        changeIpAndOpenWindow();
      },3000);
    }else{
        ip_get_count++;
        setTimeout(openWindow,10000);
    }
  });
}


function closeAllWindows(callback) {
  console.log('run closeAllWindows');

  chrome.windows.getAll(function(windows) {
		console.log('chrome.windows.getAll');
    var length = windows.length;
    var i = 0, index = 0;
    for(; i < length; i++) {
      if (windows[i].type === 'popup') {
        index++;
        if (index == length) {
          callback && callback();
        }
      }
      else {
        chrome.windows.remove(windows[i].id, function() {
          index++;
          if (index == length) {
            callback && callback();
          }
        });
      }
    }
  });
}

function orderSuccess(business_oid){
  if(business_oid){
    api.orderSubmit(task.task_id,business_oid, function (data) {
      if(data.success == 1){
        changeIpAndOpenWindow();
      }else{
        setTimeout(function(){
          last_watchdog_time = new Date().getTime();
          orderSuccess(business_oid);
        },3000);
      }
    }, function () {
      setTimeout(function(){
        last_watchdog_time = new Date().getTime();
        orderSuccess(business_oid);
      },2000);
    });
  }else{
    changeIpAndOpenWindow();
  }
}

function resetAccount(){
  api.resetAccount(task.task_id,function(data){
    if(data.success){
      changeIpAndOpenWindow();
    }else{
      changeIpAndOpenWindow();
    }
  },function(){
    changeIpAndOpenWindow();
  })
}

function messageListener(){
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('onMessage：',message);
    //console.log(sender);
    if (settings.running) {

      var cmd = message.cmd;
      if(cmd == 'task_done' || cmd == 'start_task'){
        changeIpAndOpenWindow();
      }
      else if(cmd == 'watchdog'){
        last_watchdog_time = new Date().getTime();
      }
      else if(cmd == 'reload_settings'){
        reloadSettings();
      }
      else if (cmd === 'cookies') {
        reportCookie(function(){
          chrome.tabs.sendMessage(sender.tab.id, {cmd: 'cookies'});
        });
      }
      else if (cmd === 'reload') {
        last_watchdog_time = new Date().getTime();
        message.cmd = 'reloaded';
        console.log(retry);
        if (retry.retry) {
          retry.retry++;
          message.retry = retry.retry;
        } else {
          message.retry = 1;
        }
        retry = message;
        console.log(retry);
        chrome.tabs.sendMessage(sender.tab.id, message);
      }
      else if (cmd === 'task') {
        chrome.storage.local.get(null, function (data) {
          task = data.task;
          chrome.tabs.sendMessage(sender.tab.id, {cmd: 'task', task: task});
        });
      }
      else if (cmd === 'settings') {
        if (settings) {
          chrome.tabs.sendMessage(sender.tab.id, {cmd: 'settings', settings: settings});
        } else {
          chrome.storage.local.get(null, function (data) {
            settings = data.settings;
            chrome.tabs.sendMessage(sender.tab.id, {cmd: 'task', settings: settings});
          });
        }
      }
      else if(cmd == 'order_success'){
        var business_oid = message.order_id;
        if(business_oid){
          orderSuccess(business_oid);
        }
      }
      else if(cmd == 'reset_account'){
        resetAccount();
      }

      sendResponse && sendResponse();
    }
  });
}

function reportCookie(callback){
  var domain = {jd: 'jd.com', yhd: 'yhd.com'};
  chrome.cookies.getAll({domain: domain[task.slug]}, function (cookies) {
    console.log(cookies);
    api.reportCookie(task.account_id, cookies, function (data) {
      if(data.success){
        callback && callback();
      }else{
        setTimeout(function () {
          last_watchdog_time = new Date().getTime();
          reportCookie(callback);
        }, 3000);
      }
    }, function () {
      setTimeout(function () {
        last_watchdog_time = new Date().getTime();
        window.location.reload(true);
      }, 2000);
    });
  });
}

function setCookies(callback){
    chrome.windows.create({
      url: 'https://www.baidu.com/',
      incognito: true
    });
    var cookies = task.cookies;
    console.log(cookies);
    console.log("set cookies");
    if(cookies){
      var length = cookies.length;
      while(length--){
        var fullCookie = cookies[length];
        //seesion, hostOnly 值不支持设置,
        var newCookie = {};
        var host_only = fullCookie.hostOnly == "false" ? false : true;
        newCookie.url = "http" + ((fullCookie.secure) ? "s" : "") + "://" + fullCookie.domain + fullCookie.path;
        newCookie.name = fullCookie.name;
        newCookie.value = fullCookie.value;
        newCookie.path = fullCookie.path;
        newCookie.httpOnly = fullCookie.httpOnly == "false" ? false : true;
        newCookie.secure = fullCookie.secure == "false" ? false : true;
        if(!host_only){ newCookie.domain = fullCookie.domain; }
        if (fullCookie.session === "true" && newCookie.expirationDate) { newCookie.expirationDate = parseFloat(fullCookie.expirationDate); }
        console.log(newCookie);
        chrome.cookies.set(newCookie);
      }
    }
    console.log("set cookies success");
    callback && callback();
}

function watchdog() {
  console.log("entrance watchdog");
  if (settings.running) {
    var time = new Date().getTime();
    console.log(parseInt((time - last_watchdog_time)/1000) +"秒");
    if (time - last_watchdog_time > 60000) {

      if(time - last_watchdog_time > 250000){
        console.log("250 seconds unactive");
        changeIpAndOpenWindow();
      }

      if(start_time && (time - start_time > 600000)){
        changeIpAndOpenWindow();
      }

      chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
        if (tabs.length > 0) {
          var current_url = tabs[0].url;
          console.log(current_url);
          last_watchdog_time = time;
          if (current_url.indexOf('yhd.com/') >=0 || current_url.indexOf('jd.com/') >=0) {
			console.log("reload " + current_url);
            chrome.tabs.reload(tabs[0].id, function() {

            });
          }

        }
      });

    }
  }

  setTimeout(watchdog, 1000);
}

function reloadSettings(success) {
  chrome.storage.local.get(null, function(data) {
    settings = data.settings ? data.settings : settings;
    console.log(settings);
    if(settings && settings.running){
      api = new RemoteApi(settings);
      success && success();
    }
  });
}

function isValidIpv4Addr(ip) {
  return /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-9]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(ip);
}
