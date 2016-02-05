**jquery.checkFrom.js**
-------------
####表单验证插件

> - 作者： iProg
> - 日期： 2016-01-12
> - 版本： 1.0.0
> - 邮箱： zxwmyemail@126.com
> - 描述： 这是一个前端的表单验证插件，方便前端表单做验证，提高开发效率



####使用方法

（1）先导入js和jquery的插件：

```html
  <script src="js/jquery-1.8.3.min.js"></script>
  <script src="js/jquery.checkForm.js"></script>
```

（2）制作表单，以 **input[type=text]** 举例说明如下：

```html
  <input type="text" name="name" required="true" validate-type="chinese" min='2' max='4' tipmsg="必填项" errmsg="只允许2-4个中文"/>
  <span style="color:red" id="name-tip"></span>
  
  1. required：是否必填；validate-type校验类型；min字符串最小长度；max字符串最大长度；tipmsg为input中没有文本时的提示语；errmsg为用户输入错误时的提示语；
2. 上面的提示语显示位置需要开发人员自己单独指定，比如上面的id值为 name-tip 的span标签就是显示提示语的，该标签需指定id属性值，属性值的规则为input的name属性值拼接上"-tip"，比如上例中为 name-tip
```

（3）对表单验证添加js的初始化校验代码，如下：

```html
   $('#demo').checkForm({
        submitBtnId : 'saveBtn',       // 提交按钮的id值
        onSubmitHandle : function(){   // 校验完毕后的提交事件，可发送ajax请求之类的
            alert('校验通过');
            // #code 这里做验证通过后的操作，如提交表单等
        }
    });
```
