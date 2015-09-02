
function RemoteApi(settings) {
  settings.env = settings.env ? settings.env : 'pro';

  switch (settings.env){
    case 'pro':
      this.server_host = 'https://disi.se';
      break;
    case 'dev':
      //this.server_host = 'http://192.168.3.68:91';
      this.server_host = 'http://192.168.3.8:8080';
      break;
    case 'test':
      this.server_host = 'http://b22.poptop.cc';
      break;
    default :
      this.server_host = '';
      break;
  }

  this.request_data = {
    host_id: settings.computer_name ? settings.computer_name : null,
    version: chrome.runtime.getManifest().version,
    app_secret: 'F$~((kb~AjO*xgn~'
  };

  this.urls = {
    getTask : '/index.php/Admin/CodOrderTaskApi/get_task',
    reportCookie : '/index.php/Admin/CodOrderTaskApi/set_cookies',
    disableAccount : '',
    resetAccount : '/index.php/Admin/CodOrderTaskApi/reset_account',
    orderSubmit : '/index.php/Admin/CodOrderTaskApi/order_submit',
    taskFail : '/index.php/Admin/CodOrderTaskApi/task_fail'
  }
}

RemoteApi.prototype = {

  ajax: function(params,done,fail){
    $.ajax(params).done(done && done()).fail(fail && fail());
  },

  get: function (url, params, done, fail) {
    $.getJSON(url,params,function(data,textStatus,jqXHR){
      done && done(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      fail && fail();
    });
  },

  post: function (url, params, done, fail) {
    $.post(url, params, function(data) {
      done && done(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail && fail();
    });
  },

  getTask: function(done_callback, fail_callback) {
    var url = this.server_host + this.urls.getTask;
    var params = this.request_data;

    this.post(url,params,done_callback,fail_callback);
  },

  resetAccount: function(task_id, done_callback, fail_back){
    var url = this.server_host + this.urls.resetAccount;
    var params = this.request_data;
    params.task_id = task_id;

    this.post(url,params,done_callback,fail_back);
  },

  orderSubmit: function(task_id,business_oid,done_callback,fail_back){
    var url = this.server_host + this.urls.orderSubmit;
    var params = this.request_data;
    params.task_id = task_id;
    params.business_oid = business_oid;

    this.post(url,params,done_callback,fail_back);
  },

  taskFail: function (task_id,message,done_callback,fail_back) {
    var url = this.server_host + this.urls.taskFail;
    var params = this.request_data;
    params.task_id = task_id;
    params.message = message;

    this.post(url,params,done_callback,fail_back);
  },

  reportCookie:function(account_id,cookies,done_callback, fail_callback){
    var url = this.server_host + this.urls.reportCookie;
    var params = this.request_data;
    params.cookies = cookies;
    params.account_id = account_id;

    this.post(url,params,done_callback,fail_callback);
  }
	
};