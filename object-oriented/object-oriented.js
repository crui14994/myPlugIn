//匿名函数防止全局污染，只将变量$$暴露在全局环境中
(function(w){
    var mpi = function() {};
    mpi.prototype = {
        //给一个对象扩充功能
        extendMany:function() {
            var key,i = 0,len = arguments.length,target = null,copy;
            if(len === 0){
                return;
            }else if(len === 1){
                target = this;
            }else{
                i++;
                target = arguments[0];
            }
            for(; i < len; i++){
                for(key in arguments[i]){
                    copy = arguments[i][key];
                    target[key] = copy;
                }
            }
            return target;
        },

        extend:function(tar,source) {
            //遍历对象
            for(var i in source){
                tar[i] = source[i];
            }
            return tar;
        }
    }
    //在框架中实例化，这样外面使用的使用就不用实例化了
    mpi = new mpi();

    /*基础模块*/
    mpi.extend(mpi,{
        /*ajax */
        myAjax:function(URL,fn){
            var xhr = createXHR();	//返回了一个对象，这个对象IE6兼容。
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                        fn(xhr.responseText);
                    }else{
                        alert("错误的文件！");
                    }
                }
            };
            xhr.open("get",URL,true);
            xhr.send();

            //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
            function createXHR() {
                //本函数来自于《JavaScript高级程序设计 第3版》第21章
                if (typeof XMLHttpRequest != "undefined") {
                    return new XMLHttpRequest();
                } else if (typeof ActiveXObject != "undefined") {
                    if (typeof arguments.callee.activeXString != "string") {
                        var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                                "MSXML2.XMLHttp"
                            ],
                            i, len;

                        for (i = 0, len = versions.length; i < len; i++) {
                            try {
                                new ActiveXObject(versions[i]);
                                arguments.callee.activeXString = versions[i];
                                break;
                            } catch (ex) {
                                //skip
                            }
                        }
                    }

                    return new ActiveXObject(arguments.callee.activeXString);
                } else {
                    throw new Error("No XHR object available.");
                }
            }
        }
    });
    /*动画模块*/
    mpi.extend(mpi,{
        //添加过度
        addTransition:function(elem,attr,t){
            elem.style.transition=attr+" linear "+t+"s";
            elem.style.webkitTransition=attr+" linear "+t+"s";
        },
        //删除过度
        removeTransition:function(elem,attr,t){
            elem.style.transition="none";
            elem.style.webkitTransition="none";
        }
    });
    /*Math模块*/
    mpi.extend(mpi,{
        /*生成一个随机数*/
        randomNum:function(begin,end){
            return Math.floor(Math.random() * (end - begin)) + begin;
        }
    });
    /*DOM查找模块*/
    mpi.extend(mpi,{
        //id查找
        $id:function(id){
            return document.getElementById(id);
        },
        //缩小搜索范围(||标签选择)
        $tag:function(tag,context){
            if(typeof context == 'string'){
                context = $$.$id(context);
            }
            if(context){
                return context.getElementsByTagName(tag);
            }else{
                return document.getElementsByTagName(tag);
            }
        },
        //class查找
        $class:function(className){
            var elements;
            var dom;
            //if(mpi.isString(context)){
            //    context = document.getElementById(context);
            //}
            if(document.getElementsByClassName){
                return document.getElementsByClassName(className);
            }else{
                dom = document.getElementsByTagName('*');
                for(var i,len=dom.length;i<len;i++) {
                    if(dom[i].className && dom[i].className ==className ) {
                        elements.push(dom[i]);
                    }
                }
            }
            return elements;

        },
        //分组选择器
        $group:function(content){
            var arr=content.split(",");
            var result=[];
            var classArr=[];
            var tagArr=[];
            removeSpace(arr);
            for(var i= 0,len=arr.length;i<len;i++){
                if(arr[i].charAt(0)=="#"){
                    result.push(mpi.$id(arr[i].slice(1)));
                }else if(arr[i].charAt(0)=="."){
                    classArr=mpi.$class(arr[i].slice(1));
                    pushArr(classArr);
                }else{
                    tagArr=mpi.$tag(arr[i]);
                    pushArr(tagArr);
                }
            };
            //return result;
            return removeDuplicatedItem(result);
            //把重复查询到的dom元素去掉
            function removeDuplicatedItem(ar) {
                var ret = [];
                for (var i = 0, j = ar.length; i < j; i++) {
                    if (ret.indexOf(ar[i]) === -1) {
                        ret.push(ar[i]);
                    }
                }
                return ret;
            }
            //把每一次的搜索结果push到result中
            function pushArr(arr){
                for(var i= 0,len=arr.length;i<len;i++){
                    result.push(arr[i]);
                }
            };
            //去除数组中每个值得空格
            function removeSpace(arr){
                for(var i=0; i<arr.length;i++){
                    arr[i]=mpi.trim(arr[i]);
                }
            };
        },
        //层次选择器
        $storey:function(content){
            var arr=[],arr2=mpi.trim(content).split(" ");
            var result=[];
            var content=[];
            var classArr=[];
            var tagArr=[];
            //把去除空格的选择器push入arr中
            for(var i= 0,len=arr2.length;i<len;i++){
                if(arr2[i]){
                    arr.push(arr2[i]);
                }
            };
            //遍历arr数组
            for(var i=0,len=arr.length;i<len;i++){
                //每次遍历把result清空，每次的查找结果保存早中间变量content中
                result=[];
                if(arr[i].charAt(0)==="#"){
                    result.push(mpi.$id(arr[i].slice(1)));
                    content=result;
                }else if(arr[i].charAt(0)==="."){
                    //如果class选择器前面没有选择器则直接查找className返回给result
                    if(content.length){
                        //遍历中间变量content
                        for(var j= 0,jen=content.length;j<jen;j++){
                            //查找每个content元素中子元素className为arr[i].slice(1)的元素保存到result中
                            if(content[j].getElementsByClassName){//兼容浏览器
                                var result2=content[j].getElementsByClassName(arr[i].slice(1));
                                pushArr(result2);
                            }else{
                                classArr=content[j].getElementsByTagName("*");
                                for(var n= 0,nen=classArr.length;n<nen;n++){
                                    if(classArr[n].className===arr[i].slice(1)){
                                        result.push(classArr[n]);
                                    }
                                }
                            }
                        }
                    }else{
                        result=mpi.$class(arr[i].slice(1));
                    }
                    content=result;
                }else{
                    //如果标签选择器前面没有选择器则直接查找标签返回给result
                    if(content.length){
                        for(var j= 0,jen=content.length;j<jen;j++){
                            tagArr=mpi.$tag(arr[i],content[j]);
                            pushArr(tagArr);
                        }
                    }else{
                        result=mpi.$tag(arr[i]);
                    }
                    content=result;
                }
            }
            return result;
            //遍历一个数组把数组中的每一个push入result中
            function pushArr(arr){
                for(var n= 0,nen=arr.length;n<nen;n++){
                    result.push(arr[n]);
                }
            }
        },
        //多组+层次
        $select:function(str) {
            var result = [];
            var item = mpi.trim(str).split(',');
            for(var i = 0, glen = item.length; i < glen; i++){
                var select = mpi.trim(item[i]);
                var context = [];
                context = mpi.$storey(select);
                pushArray(context);

            };
            return result;

            //封装重复的代码
            function pushArray(doms){
                for(var j= 0, domlen = doms.length; j < domlen; j++){
                    result.push(doms[j])
                }
            }
        },
        //html5实现的选择器；注意返回的是一个集合
        $all:function(selector,context){
            context = context || document;
            return  context.querySelectorAll(selector);
        }
    });
    /*字符串操作模块*/
    mpi.extend(mpi,{
        //去除左边空格
        ltrim:function(str){
            return str.replace(/(^\s*)/g,'');
        },
        //去除右边空格
        rtrim:function(str){
            return str.replace(/(\s*$)/g,'');
        },
        //去除空格
        trim:function(str){
            return str.replace(/(^\s*)|(\s*$)/g, '');
        }
    });
    /*类型判断模块*/
    mpi.extend(mpi,{

        isNumber:function (val){
            return typeof val === 'number' && isFinite(val)
        },
        isBoolean:function (val) {
            return typeof val ==="boolean";
        },
        isString:function (val) {
            return typeof val === "string";
        },
        isUndefined:function (val) {
            return typeof val === "undefined";
        },
        isObj:function (str){
            if(str === null || typeof str === 'undefined'){
                return false;
            }
            return typeof str === 'object';
        },
        isNull:function (val){
            return  val === null;
        },
        isArray:function (arr) {
            if(arr === null || typeof arr === 'undefined'){
                return false;
            }
            return arr.constructor === Array;
        }
    });
    /*事件模块*/
    mpi.extend(mpi,{
        on: function (id, type, fn) {
            //var dom = document.getElementById(id);
            var dom = mpi.isString(id)?document.getElementById(id):id;
            //如果支持
            //W3C版本 --火狐 谷歌 等大多数浏览器
            //如果你想检测对象是否支持某个属性，方法，可以通过这种方式
            if(dom.addEventListener) {
                dom.addEventListener(type, fn, false);
            }else if(dom.attachEvent){
                //如果支持 --IE
                dom.attachEvent('on' + type, fn);
            }
        },
        un:function(id, type, fn) {
            //var dom = document.getElementById(id);
            var dom = mpi.isString(id)?document.getElementById(id):id;
            if(dom.removeEventListener){
                dom.removeEventListener(type, fn);
            }else if(dom.detachEvent){
                dom.detachEvent(type, fn);
            }

        },
        //鼠标点击
        click:function(id,fn){
            this.on(id,"click",fn);
        },
        //鼠标进入
        mouseover:function(id,fn){
            this.on(id,"mouseover",fn);
        },
        //鼠标移出
        mouseout:function(id,fn){
            this.on(id,"mouseout",fn);
        },
        //鼠标悬浮
        hover:function(id,fnOver,fnOut){
            if(fnOver){
                this.on(id,"mouseover",fnOver);
                if(arguments.length==2){
                    this.on(id,"mouseout",fnOver);
                }
            }
            if(fnOut){
                this.on(id,"mouseout",fnOut);
            }
        },
        // 获取事件event对象
        getEvent:function(e){
            return e?e:window.event;
        },
        //通过event获取目标元素
        getTarget:function(e){
            return this.getEvent(e).target || this.getEvent(e).srcElement;
        },
        //阻止默认行为
        perventDefault:function(e){
            var event=this.getEvent(e);
            if(event.perventDefault){
                event.perventDefault();
            }else{
                event.returnValue=false;
            }
        },
        //阻止冒泡
        stopPropagation:function(e){
            var event=this.getEvent(e);
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble=true;
            }
        },
        //事件委托
        delegate:function (pid, eventType, selector, fn) {
            //参数处理
            var parent = mpi.$id(pid);
            function handle(e){
                var target = mpi.getTarget(e);
                if(target.nodeName.toLowerCase()=== selector || target.id === selector || target.className.indexOf(selector) != -1){
                    // 在事件冒泡的时候，回以此遍历每个子孙后代，如果找到对应的元素，则执行如下函数
                    // 为什么使用call，因为call可以改变this指向
                    // 大家还记得，函数中的this默认指向window，而我们希望指向当前dom元素本身
                    fn.call(target);
                }
            }
            //当我们给父亲元素绑定一个事件，他的执行顺序：先捕获到目标元素，然后事件再冒泡
            //这里是是给元素对象绑定一个事件
            parent["on"+eventType]=handle;
        }
    });
    /*css框架*/
    mpi.extend(mpi,{
        //设置或者获取css样式
        css:function(elems,key,value){
            var doms=mpi.isString(elems)?mpi.$all(elems):elems;
            //如果是数组要遍历，否则不用遍历；优化性能
            if(doms.length){
                if(value){
                    for(var i=0;i<doms.length; i++){
                        setStyle(doms[i],key,value);
                    }
                }else{
                    return getStyle(doms[0]);
                }
            }else{
                if(value){
                    setStyle(doms,key,value);
                }else{
                    return getStyle(doms);
                }
            }
            //获得一个元素的样式
            function getStyle(dom){
                //兼容部分ie
                if(dom.currentStyle){
                    return dom.currentStyle[key];
                }else{
                    return window.getComputedStyle(dom,null)[key];
                }
            };
            //设置一个元素的样式
            function setStyle(dom,key,value){
                dom.style[key]=value;
            }
        },
        //显示元素
        show:function (content){
            var doms =  mpi.$all(content)
            for(var i= 0,len=doms.length;i<len;i++){
                mpi.css(doms[i], 'display', 'block');
            }
        },
        //隐藏元素
        hide:function (content){
            var doms =  mpi.$all(content)
            for(var i= 0,len=doms.length;i<len;i++){
                mpi.css(doms[i], 'display', 'none');
            }
        },
        //元素高度宽度
        //元素的实际高度+border，也不包含滚动条
        Width:function (id){
            return mpi.$id(id).clientWidth
        },
        Height:function (id){
            return mpi.$id(id).clientHeight
        },
        //元素的滚动高度和宽度
        //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
        scrollWidth:function (id){
            return mpi.$id(id).scrollWidth
        },
        scrollHeight:function (id){
            return mpi.$id(id).scrollHeight
        },
        //获取屏幕的高度和宽度
        screenHeight:function (){
            return  window.screen.height
        },
        screenWidth:function (){
            return  window.screen.width
        },
        //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
        //计算方式 scrollTop scrollLeft
        scrollTop:function (id){
            return mpi.$id(id).scrollTop
        },
        scrollLeft:function (id){
            return mpi.$id(id).scrollLeft
        },
        //文档视口的高度和宽度
        wWidth:function (){
            return document.documentElement.clientWidth
        },
        wHeight:function (){
            return document.documentElement.clientHeight
        },
        //文档滚动区域的整体的高和宽
        wScrollHeight:function () {
            return document.body.scrollHeight
        },
        wScrollWidth:function () {
            return document.body.scrollWidth
        },
        //获取滚动条相对于其顶部的偏移
        wScrollTop:function () {
            var scrollTop = window.pageYOffset|| document.documentElement.scrollTop || document.body.scrollTop;
            return scrollTop
        },
        //获取滚动条相对于其左边的偏移
        wScrollLeft:function () {
            var scrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
            return scrollLeft
        }
    });
    /*属性框架*/
    mpi.extend(mpi,{
        //属性操作，获取属性的值，设置属性的值
        attr:function(elems, key, value){
            var dom =mpi.isString(elems)?mpi.$all(elems):elems;
            if(dom.length){
                if(value){
                    for(var i= 0, len=dom.length; i <len; i++){
                        dom[i].setAttribute(key, value);
                    }
                }else{
                    return dom[0].getAttribute(key);
                }
            }else{
                if(value){
                    dom.setAttribute(key, value);
                }else{
                    return dom.getAttribute(key);
                }
            }
        },
        //动态添加class
        addClass:function (elems, name){
            var doms =mpi.isString(elems)?mpi.$all(elems):elems;
            if(doms.length){
                for(var i= 0,len=doms.length;i<len;i++){
                    addName(doms[i]);
                }
            }else{
                addName(doms);
            }
            function addName(dom){
                dom.className = dom.className + ' ' + name;
            }
        },
        //动态移除class
        removeClass:function (elems, name){
            var doms = mpi.isString(elems)?mpi.$all(elems):elems;
            if(doms.length){
                for(var i= 0,len=doms.length;i<len;i++){
                    removeName(doms[i]);
                }
            }else{
                removeName(doms);
            }
            function removeName(dom){
                dom.className = dom.className.replace(name, '');
            }
        },
        //判断是否有某一个class属性
        hasClass:function(id,name){
            var doms = mpi.$all(id);
            if(doms.length){
                var flag = true;
                for(var i= 0,len=doms.length;i<len;i++){
                    flag = flag && check(doms[i],name)
                }
                return flag;
            }
            //判定单个元素
            function check(element,name){
                return -1<(" "+element.className+" ").indexOf(" "+name+" ")
            }
        },
        //获取
        getClass:function (id){
            var doms = mpi.$all(id)
            return mpi.trim(doms[0].className).split(" ")
        }
    });
    /*DOM内容操作模块*/
    mpi.extend(mpi,{
        /*//innerHTML的获取或设置*/
        html:function (context, value){
            var doms = mpi.$all(context);
            if(value){
                for(var i= 0,len= doms.length; i<len; i++){
                    doms[i].innerHTML = value;
                }
            }else{
                return doms[0].innerHTML;
            }
        },
        //选择
        eq:function(){},
        first:function(){},
        last:function(){},
        //元素的
        append:function(){},
        //插入
        empty:function(){},
        //删除
        remove:function(){},
        // 克隆
        clone:function(){}
    });

    /*通过全局变量$$将匿名函数变量mpi设置为全局变量*/
    w.$$=mpi;


})(window);

