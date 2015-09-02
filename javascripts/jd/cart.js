var init = new Init();
var task = null;
var settings = null;
messageListener();
setTimeout(function(){
    init.sendMessage('settings');
},3000);

function checkItem(){
    var cart_items = $('#cart-list').find('.cart-item-list');

    if(cart_items.length > 0){
        if(cart_items.length !=1){
            checkAll();
        }else{
            var items = $('.item-item');
            if(items.length == 1){
                var item_links = items.find('.p-img a');
                var quantities = items.find('.quantity-form input');
                console.log(item_links);
                if(item_links.length == 1 && quantities.length == 1){
                    var item_link = item_links[0];
                    var quantity = quantities[0];
                    console.log(item_link);
                    console.log(item_link.href);
                    console.log(quantity);
                    if(quantity.value == 1){
                        if(item_link.href == task.product_url){

                            orderSubmit();
                        }else{
                            checkAll();
                        }
                    }else{
                        quantity.value = 1;
                        setTimeout(function(){
                            init.watchDog();
                            window.location.reload(true);
                        },2000);
                    }
                }else{

                }
            }else{
                //checkAll();
            }
        }
    }else{
        orderList();
    }
}


function messageListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

        if(message.cmd === 'task'){
            task = message.task;
            console.log(task);
            checkItem();
        }
        else if(message.cmd === 'settings'){
            settings = message.settings;
            console.log(settings);
            init.sendMessage('task');
        }
    });
}

function orderSubmit(){
    var submit_btn = $('.submit-btn');
    if(submit_btn.length > 0){
        setTimeout(function () {
            submit_btn[0].click();
        },2000);
    }else{

    }
}

function orderList(){
    setTimeout(function () {
        init.watchDog();
        window.open('http://order.jd.com/center/list.action');
    },3000);
}

function checkAll(){
    console.log('全选');
    var check_all = $('#toggle-checkboxes_up');
    if(check_all.length > 0){
        if(check_all[0].checked == true){
            removeAll();
        }else{
            check_all[0].checked = true;
            setTimeout(function(){
                init.watchDog();
                checkAll();
            },3000)
        }
    }else{

    }
}

function removeAll(){
    var remove_batch = $('.remove-batch');
    if(remove_batch.length > 0){
        remove_batch[0].click();
    }else{

    }
}

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if(mutation.type === 'childList'){
            console.log(mutation);
            console.log(mutation.target);
            if(mutation.target.className == 'ui-dialog-content'){
                var tip_box = $('.tip-box').find('a:contains("删除")');
                if(tip_box.length > 0){
                    tip_box[0].click();
                    setTimeout(function () {
                        init.watchDog();
                        window.location.reload(true);
                    },2000);
                }
            }
        }
        if(mutation.type === 'attributes'){

        }
    });
});

observer.observe(document.body, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true
});