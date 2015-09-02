var init = new Init();
var deleted = false;
var address = {};

jdMunicipality(address,function(){
    setTimeout(function(){
        var address_default = $("#addressList .sm").find("span:contains('默认地址')");
        var set_default_btn = $("#addressList a:contains(设为默认)");
        if(address_default.length > 0 || set_default_btn.length == 0){
            tryDeleteAllAddress();
        }else{
            var default_btn = $("#addressList a:contains(设为默认)").first();
            if(default_btn.length > 0){
                console.log('没有默认，设第一个默认');
                default_btn[0].click();
                setTimeout(function(){
                    window.location.reload(true);
                },5000);
            }else{
                tryDeleteAllAddress();
            }

        }

    },3000);
});



//删除所有的收货地址，，每次只删除第一个
function tryDeleteAllAddress(){
    if(deleted) {return false;}
    var address_list = $("#addressList .sm");
    var address_div = address_list.last();
    var del_btn = address_div.find(".del-btn:visible");
    if(del_btn.length > 0){
        var address_id = address_div.prop('id').match(/\d+/g)[0];
        if(address_div.find("span:contains('默认地址')").length > 0){
            var name = address_div.find("span:contains('收货人')").next('.fl')[0].innerText;
            var where_area = address_div.find("span:contains('所在地')").next('.fl')[0].innerText;
            var where = address_div.find("span:contains('地址')").next('.fl')[0].innerText;
            var mobile = address_div.find("span:contains('手机')").next('.fl')[0].innerText.match(/\d+/g);
            var its_name = name == address.name;
            var its_where = where==address.short_address;
            var address_where_area = address.province+(address.city?address.city:'')+(address.area?address.area:'')+(address.street?address.street:'');
            //var its_where_area = where_area.indexOf(address.province)!=-1&&where_area.indexOf(address.city?address.city:'')!=-1&&where_area.indexOf(address.area?address.area:'')!=-1;
            var its_where_area = where_area.replace(/省|市/g,'') == address_where_area.replace(/省|市/g,'');
            var its_mobile = address.mobile.indexOf(mobile[0])==0&&address.mobile.substr(-4).indexOf(mobile[1])==0;

            if(its_name && its_where && its_where_area && its_mobile){
                //地址一样，不需要修改
                console.log("默认地址 一样");
                setTimeout(function () {
                    init.watchDog();
                    goItemProduct();
                },3000);
            }else{
                console.log("默认地址不一致，删除");
                setTimeout(function(){
                    delAddress(address_id);
                },2000);
            }

        }else{
            setTimeout(function(){
                delAddress(address_id);
            },2000);
        }


    }else{
        console.log("添加收货地址");
        deleted = true;
        console.log(address);
        autoAddress();
    }

}

function goItemProduct(){
    if(task.product_url){
        window.open(task.product_url);
    }else{

    }
}

function autoAddress(){
    init.watchDog();
    var get_province_url = "http://easybuy.jd.com//address/getProvinces.action";
    var get_city_url = "http://easybuy.jd.com//address/getCitys.action";
    var get_county_url = "http://easybuy.jd.com//address/getCountys.action";
    var get_town_url = "http://easybuy.jd.com//address/getTowns.action";
    var submit_address_url = "http://easybuy.jd.com/address/addAddress.action";

    var province_name = address.province;
    var city_name = address.city;
    var area_name = address.area;
    var street_name = address.street;

    var province_options = null;
    var city_options = null;
    var county_options = null;
    var town_options = null;


    async.waterfall([
        function (callback){

            var provinces = jd_address_provinces;
            province_options = provinces;
            var province_id = getAddressJsonKey(province_name,provinces);
            console.log('省份 '+provinces[province_id]);
            callback(null,province_id);

        },
        function (province_id, callback){

            var citys = jd_address_citys[province_id];
            city_options = citys;
            var city_id = getAddressJsonKey(city_name,citys);
            console.log('城市 '+citys[city_id]);
            callback(null, province_id, city_id);

        },
        function (province_id, city_id, callback){

            var countys = jd_address_countys[city_id];
            county_options = countys;
            var county_id = getAddressJsonKey(area_name,countys);
            console.log('乡镇 '+countys[county_id]);
            callback(null, province_id, city_id, county_id);

        },
        function (province_id, city_id, county_id, callback){
            console.log('town');
            var towns = jd_address_towns[county_id];
            console.log('towns');
            town_options = towns;
            console.log('town_options');
            console.log(street_name);
            console.log(towns);
            var town_id = getAddressJsonKey(street_name,towns);
            console.log(town_id);
            console.log('town_id');
            towns[town_id] !== undefined ? console.log('街道 '+towns[town_id]) : null;
            console.log('towns[town_id] !== undefined');
            callback(null, province_id, city_id, county_id, town_id);

        },
        function(province_id, city_id, county_id, town_id, callback){
            console.log('reload');
            init.watchDog();
            console.log("地址生成，等待保存后刷新");
            setTimeout(function(){
                address.short_address = address.short_address.length>50?address.short_address.substr(0,50):address.short_address;
                var fullAddress = province_name;
                fullAddress += city_options[city_id]!==undefined?city_options[city_id]:'';
                fullAddress += county_options[county_id]!==undefined?county_options[county_id]:'';
                fullAddress += town_options[town_id]!==undefined?town_options[town_id]:'';
                fullAddress += address.short_address;
                var form_data = {
                    'consigneeName' : address.name,
                    'provinceId'    : province_id,
                    'cityId'        : city_id,
                    'countyId'      : county_id,
                    'townId'        : town_id,
                    'consigneeAddress': address.short_address,
                    'mobile'        : address.mobile,
                    'fullAddress'   : fullAddress,
                    'phone'         : '',
                    'email'         : '',
                    'addressAlias'  : province_name + '家里',
                    'easyBuy'       : undefined
                };

                //保存收货地址信息
                var order_address = {
                    name: form_data.consigneeName,
                    province: province_name,
                    city: city_options[city_id]!==undefined?city_options[city_id]:'',
                    area: county_options[county_id]!==undefined?county_options[county_id]:'',
                    street: town_options[town_id]!==undefined?town_options[town_id]:'',
                    short_address: form_data.consigneeAddress,
                    mobile: form_data.mobile
                };
                $.ajax( {
                    type : "POST",
                    dataType : "text",
                    url : submit_address_url,
                    data :json2string(form_data),
                    cache : false,
                    success : function(dataResult) {
                        callback(null, order_address);
                    },
                    error : function(XMLHttpResponse) {
                        callback(null, order_address);
                    }
                });
            },6000);
        }
    ],function(err, results){

        setTimeout(function(){
            init.watchDog();
            window.location.reload(true);
        },2000);

    });

}

function getAddressJsonKey(value,object){
    if(!value){
        return 0;
    }
    if(!object){
        return 0;
    }
    var length = 0;
    var arr_keys = [];
    for(var key in object){
        length ++;
        arr_keys.push(key);
        var v = object[key];
        console.log(v);
        if(value != '' && v.indexOf(value) != -1){
            console.log("return key",key);
            return key;
        }
    }

    var key = arr_keys[init.rands(0,length-1)];
    console.log( "random", arr_keys,length,key);
    return key;
}

function delAddress(addressId){
    var del_address_url = "http://easybuy.jd.com/address/deleteAddress.action";
    $.ajax({
        type : "POST",
        dataType : "text",
        url : del_address_url,
        data : "addressId=" + addressId,
        cache : false,
        success : function(dataResult) {
            console.log("多余地址删除，刷新");
            setTimeout(function(){
                window.location.reload(true);
            },2000);
        },
        error : function(XMLHttpResponse) {
            console.log("多余地址删除，刷新");
            setTimeout(function(){
                window.location.reload(true);
            },2000);
        }
    });
}

function json2string(json){
    var str = '';
    for(var i in json){
        str += 'addressInfoParam.' + i + '=' + json[i] + '&';
    }
    str = str.substring(0, str.length-1);
    return str;
}

//京东地址直辖市处理
function jdMunicipality(address,callback) {
    chrome.storage.local.get(null, function (local) {
        task = local.task;
        address.province = task.consignee_province;
        address.city = task.consignee_city;
        address.area = task.consignee_area;
        address.street = task.consignee_town;
        address.name = task.consignee_name;
        address.mobile = task.consignee_mobile;
        address.short_address = task.consignee_address;
        console.log(address);
        if (address.province == '北京' || address.province == '上海' || address.province == '天津' || address.province == '重庆') {

            if(address.city.indexOf(address.province) == -1 && address.area != null){
                address.street = address.area;
                address.area = address.city;
                address.city = address.province;
            }

            //北京 北京
            console.log('京东地址直辖市处理');
            if(address.city.indexOf(address.province) != -1){
                console.log('北京');
                address.city = address.area;
                address.area = address.street;
                address.street = '';
                console.log(address);
            }


        }
        console.log(address);
        callback && callback();
    });

}
