/*****************************************************************************************************
 表单校验插件

 @author   iProg原创
 @date     2016-01-21

 使用方法参见demo.html
 小提示：
 校验的错误提示信息的标签需要指定，指定的规则举例：
 <input type="text" name="username" required="true" validate-type="all" min='2' max='6' errmsg="必填项，任意2-6字符，但不能为空"/>

 那么错误提示信息的标签，需要指定属性id值，id值 = name属性值 和 -tip 组装，所以就是username-tip
 <span style="color:red" id="username-tip"></span>
******************************************************************************************************/
;(function($){
    $.fn.formValidate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.formValidate');
        }
    };

    // 校验规则，对应validate-type属性的值
    var validateRules = {
        chinese : function(str, min, max){     // 只能是中文, min表示最小几位，max表示最多几位
            if (min && max) {
                return new RegExp("^[\\u0391-\\uFFE5]{"+min+","+max+"}$","g").test(str);
            }else if (min && !max) {
                return new RegExp("^[\\u0391-\\uFFE5]{"+min+",}$","g").test(str);
            }else if (!min && max) {
                return new RegExp("^[\\u0391-\\uFFE5]{0,"+max+"}$","g").test(str);
            }else{
                return /^[\u0391-\uFFE5]+$/.test(str);
            }
        },
        all     : function(str, min, max){     // 任意字符, min表示最小几位，max表示最多几位
            var str = $.trim(str);

            if (min && max) {
                return str.length >= min && str.length <= max;
            }else if (min && !max) {
                return str.length >= min;
            }else if (!min && max) {
                return str.length <= max;
            }else{
                return $.trim(str) == '' ? false : true;
            }
        },
        number  : function(str, min, max){     // 只能是正的整形数字, min表示最小的数字，max表示最大的数字
            if (min && max) {
                if (/^\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str >= min && str <= max;
                }else{
                    return false;
                }
            }else if (min && !max) {
                if (/^\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str >= min;
                }else{
                    return false;
                }
            }else if (!min && max) {
                if (/^\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str <= max;
                }else{
                    return false;
                }
            }else{
                return /^\d+$/.test(str);
            }
        },
        integer  : function(str, min, max){    // 只能是正的或负的整形数字, min表示最小的数字，max表示最大的数字
            if (min && max) {
                if (/^[-\+]?\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str >= min && str <= max;
                }else{
                    return false;
                }
            }else if (min && !max) {
                if (/^[-\+]?\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str >= min;
                }else{
                    return false;
                }
            }else if (!min && max) {
                if (/^[-\+]?\d+$/.test(str)) {
                    var str = parseInt(str);
                    return str <= max;
                }else{
                    return false;
                }
            }else{
                return /^[-\+]?\d+$/.test(str);
            }
        },
        float    : function(str, min, max){    // 只能是数字（整数和浮点数）, min表示最小的数字，max表示最大的数字
            if (min && max) {
                if (/^[-\+]?\d+(\.\d+)?$/.test(str)) {
                    var str = parseFloat(str);
                    return str >= min && str <= max;
                }else{
                    return false;
                }
            }else if (min && !max) {
                if (/^[-\+]?\d+(\.\d+)?$/.test(str)) {
                    var str = parseFloat(str);
                    return str >= min;
                }else{
                    return false;
                }
            }else if (!min && max) {
                if (/^[-\+]?\d+(\.\d+)?$/.test(str)) {
                    var str = parseFloat(str);
                    return str <= max;
                }else{
                    return false;
                }
            }else{
                return /^[-\+]?\d+(\.\d+)?$/.test(str);
            }
        },
        string  : function(str, min, max){     // 只能是英文字母, min表示最小几位，max表示最多几位
            if (min && max) {
                return new RegExp("^[A-Za-z]{"+min+","+max+"}$").test(str);
            }else if (min && !max) {
                return new RegExp("^[A-Za-z]{"+min+",}$").test(str);
            }else if (!min && max) {
                return new RegExp("^[A-Za-z]{0,"+max+"}$").test(str);
            }else{
                return /^[A-Za-z]+$/.test(str);
            }
            
        },
        strnum  : function(str, min, max){     // 只能是英文和数字, min表示最小几位，max表示最多几位
            if (min && max) {
                return new RegExp("^[A-Za-z0-9]{"+min+","+max+"}$").test(str);
            }else if (min && !max) {
                return new RegExp("^[A-Za-z0-9]{"+min+",}$").test(str);
            }else if (!min && max) {
                return new RegExp("^[A-Za-z0-9]{0,"+max+"}$").test(str);
            }else{
                return /^[A-Za-z0-9]+$/.test(str);
            }
        },
        date : function(str, min, max){        // 日期验证yyyy-mm-dd  或者 yyyy/mm/dd，从1800年开始至9999年(支持闰年验证)
            var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/ig;
            return reg.test(str);           
        },
        datetime : function(str, min, max){    // 日期验证yyyy-mm-dd HH:mm:ss  或者 yyyy/mm/dd HH:mm:ss，从1800年开始至9999年(支持闰年验证)
            var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29) (([01]?[0-9])|(2[0-3])):[0-5]?[0-9]:[0-5]?[0-9]$))/ig;
            return reg.test(str);   
        },
        email  : function(str, min, max){      // 只能是邮箱, 这里的min和max参数无用
            return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(str);
        },
        url    : function(str, min, max){      // 只能是url地址, 这里的min和max参数无用
            return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test(str);
        },
        phone  : function(str, min, max){      // 只能是手机号码, 这里的min和max参数无用
            return /^1((3\d|5[0-35-9]|8[025-9])\d|70[059])\d{7}$/.test(str);
        },
        safeStr : function(str, min, max){    // 安全字符校验, 这里的min和max参数无用
            return !/^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/.test(str);
        },
        uploadfile : function(str, min, max){ // 文件上传校验, 这里的min和max参数无用
            return str ? true : false;
        },
        radio : function(str, min, max){      // 单选框校验, 这里的min和max参数无用
            return str > 0 ;
        },
        checkbox : function(str, min, max){   // 复选框校验
            if (min && max) {
                return str >= min && str <= max;
            }else if (min && !max) {
                return str >= min;
            }else if (!min && max) {
                return str > 0 && str <= max;
            }else{
                return str > 0;
            }
        },
        select  : function(str, min, max){     // 下拉框校验
            if (min && max) {
                return str >= min && str <= max;
            }else if (min && !max) {
                return str >= min;
            }else if (!min && max) {
                return str > 0 && str <= max;
            }else{
                return str > 0;
            }
        }

    }

    // 私有方法
    var privateMethods = {
        bindValidateEvents : function(sourceObj){
            // 为input的text域，textarea域绑定hover和keyup事件
            sourceObj.find('input[type=text][required=true],textarea[required=true]').hover(
                function(){  privateMethods._validate($(this), 1); },
                function(){  privateMethods._validate($(this), 0); }
            ).keyup(function(){
                privateMethods._validate($(this), 1);
            });

            // 为input的file绑定hover和change事件
            sourceObj.find('input[type=file][required=true]').hover(
                function(){ privateMethods._validate($(this), 1); },
                function(){ privateMethods._validate($(this), 0); }
            ).change(function(){
                privateMethods._validate($(this), 1);
            });

            // 为input的radio绑定hover和click事件
            sourceObj.find('input[type=radio][required=true]').hover(
                function(){
                    var name = $(this).attr('name');
                    var checkObj = $('input[name='+name+']:checked');
                    privateMethods._validateRadio(checkObj, $(this), 1);
                },
                function(){
                    var name = $(this).attr('name');
                    var checkObj = $('input[name='+name+']:checked');
                    privateMethods._validateRadio(checkObj, $(this), 0);
                }
            ).click(function(){
                var name = $(this).attr('name');
                var checkObj = $('input[name='+name+']:checked');
                privateMethods._validateRadio(checkObj, $(this), 1);
            });

            // 为input的checkbox绑定hover和click事件
            sourceObj.find('input[type=checkbox][required=true]').hover(
                function(){
                    var name = $(this).attr('name');
                    var checkObj = $('input[name='+name+']:checked');
                    privateMethods._validateCheckbox(checkObj, $(this), 1);
                },
                function(){
                    var name = $(this).attr('name');
                    var checkObj = $('input[name='+name+']:checked');
                    privateMethods._validateCheckbox(checkObj, $(this), 0);
                }
            ).click(function(){
                var name = $(this).attr('name');
                var checkObj = $('input[name='+name+']:checked');
                privateMethods._validateCheckbox(checkObj, $(this), 1);
            });

            // 为select绑定hover和change事件
            sourceObj.find('select[required=true]').hover(
                function(){  privateMethods._validateSelect($(this), 1); },
                function(){  privateMethods._validateSelect($(this), 0); }
            ).change(function(){
                privateMethods._validateSelect($(this), 1);
            });
        },
        validateOnSubmit : function(sourceObj){
            var result = true;
            sourceObj.find('input[type=text][required=true],textarea[required=true],input[type=file][required=true]').each(function(i){
                var res = privateMethods._validate($(this), 1);
                if (!res) result = false;
            });

            sourceObj.find('input[type=radio][required=true]').each(function(i){
                var name = $(this).attr('name');
                var checkObj = $('input[name='+name+']:checked');
                var res = privateMethods._validateRadio(checkObj, $(this), 1);
                if (!res) result = false;
            });

            sourceObj.find('input[type=checkbox][required=true]').each(function(i){
                var name = $(this).attr('name');
                var checkObj = $('input[name='+name+']:checked');
                var res = privateMethods._validateCheckbox(checkObj, $(this), 1);
                if (!res) result = false;
            });

            sourceObj.find('select[required=true]').each(function(i){
                var res = privateMethods._validateSelect($(this), 1);
                if (!res) result = false;
            });

            return result;
        },
        _validate : function(selfObj, type){
            var value = selfObj.val();
            var min = selfObj.attr('min') ? selfObj.attr('min') : 0;
            var max = selfObj.attr('max') ? selfObj.attr('max') : 0;
            return privateMethods._callValidateRules(selfObj, value, min, max, type);
        },
        _validateRadio : function(checkObj, selfObj, type){
            var value = checkObj.length;
            return privateMethods._callValidateRules(selfObj, value, 0, 0, type);
        },
        _validateCheckbox : function(checkObj, selfObj, type){
            var value = checkObj.length;
            var min = selfObj.attr('min') ? selfObj.attr('min') : 0;
            var max = selfObj.attr('max') ? selfObj.attr('max') : 0;
            return privateMethods._callValidateRules(selfObj, value, min, max, type);

        },
        _validateSelect : function(selfObj, type){
            var value = selfObj.val();
            var min = max = 0;
            if (selfObj.attr('multiple') == 'multiple') {
                min = selfObj.attr('min') ? selfObj.attr('min') : 0;
                max = selfObj.attr('max') ? selfObj.attr('max') : 0;
                value = value ? value.length : 0;
            }else{
                value = value ? 1 : 0;
            }
            return privateMethods._callValidateRules(selfObj, value, min, max, type);
        },
        _callValidateRules : function(selfObj, value, min, max, type){
            var result = false;

            var validateType = selfObj.attr('validate-type');
            if (validateType) {
                var flag = eval('validateRules.'+validateType+'("'+value+'",'+min+','+max+')');
                if (!flag) {
                    if (type == 0) {
                        $("#"+selfObj.attr('name')+"-tip").html('');
                    }else if (type == 1) {
                        var errmsg = selfObj.attr('errmsg');
                        if (errmsg) {
                            $("#"+selfObj.attr('name')+"-tip").html(errmsg);
                        }
                    }
                }else{
                    $("#"+selfObj.attr('name')+"-tip").html('');
                    result = true;
                }
            }

            return result;
        }

    }

    var methods = {
        init : function (_options) {
            return this.each(function() {
                var $this = $(this);
                var options = $.extend({}, $.fn.formValidate.defaults, _options);

                // 绑定hover、keyup、change事件
                privateMethods.bindValidateEvents($this);

                // 点击提交按钮触发的事件
                if (options.submitBtnId) {
                    $("#"+options.submitBtnId).click(function(){
                        // 点击时，也要校验一遍哦
                        var checkResult = privateMethods.validateOnSubmit($this);
                        if (checkResult)  options.onSubmitHandle.apply(this);
                    });
                }

            });
        }
    };

    // 默认参数
    $.fn.formValidate.defaults = {
        submitBtnId : false,
        onSubmitHandle : $.noop
    };
})(jQuery);
