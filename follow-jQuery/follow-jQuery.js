//匿名函数防止全局污染
(function(window){
    //为了以后能方便借用数组的各种方法，提前存到变量中，全局都是用这一个数组，节约空间
    var arr = [];
    var push = arr.push;
    var splice = arr.splice;
    var slice = arr.slice;
    //模拟jQuery中的Sizzle引擎，利用选择器获取元素
    function Sizzle(seletcor) {
        return document.querySelectorAll(seletcor);
    }
    //定义mpi的核心方法
    var mpi =function(selector){
        return new mpi.fn.init(selector);
    }
    //使用原型替换，给mpi定义原型，并且把mpi原型的索引复制给mpi.fn
    mpi.fn=mpi.prototype={
        constructor: mpi,
        //定义初始化函数
        init: function (selector) {
            //为了把获取到的dom元素，并把获取到的dom元素包装成一个数组，并保存在this中借用数组的splice方法，清空this最终存储的属性
            splice.call(this,0,this.length);
            //借用数组的push，把获取到的dom元素包装成一个数组，并保存在this中
            push.apply(this,Sizzle(selector));
            //为了可以使用链式编程
            return this;
        }

    };
    /*给mpi对象和原型对象定义一个扩展方法和属性的方法*/
    mpi.fn.extend=mpi.extend = function() {
        var target, sources;
        var arg0 = arguments[0];
        if (arg0.length == 0) return this;

        if (arguments.length == 1) {
            target = this;
            sources = [arg0];
        } else {
            target = arg0;
            sources = slice.call(arguments, 1);
        }
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for (var key in source) {
                target[key] = source[key];
            }
        }
        return target;
    };


    /*在mpi上扩展框架，使可以直接使用.调用*/

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
            };
        },
        //遍历（数组的遍历或者对象的遍历）
        each: function (array, callback) {
            var len = array.length;
            var i;
            if (typeof len === "number" && len >= 0) {
                for (i = 0; i < len;) {
                    if (callback.call(array[i], i, array[i++]) === false) {
                        break;
                    }
                }
            } else {
                for (i in array) {
                    if (callback.call(array[i], i, array[i]) === false) {
                        break;
                    }
                }
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
        }
    });
    /*Math模块*/
    mpi.extend(mpi,{
        /*生成一个随机数*/
        randomNum:function(begin,end){
            return Math.floor(Math.random() * (end - begin)) + begin;
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
        //去左右空格
        trim:function(str){
            return str.replace(/(^\s*)|(\s*$)/g, "");
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
    /*获取屏幕尺寸相关信息模块*/
    mpi.extend(mpi,{
        //获取屏幕的高度和宽度
        screenHeight:function (){
            return  window.screen.height
        },
        screenWidth:function (){
            return  window.screen.width
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
    /*dom操作模块*/
    mpi.fn.extend(mpi.fn,{
        //对查询到的doms数组中的每一个元素执行callback
        each: function (callback) {
            mpi.each(this, callback);
            return this;
        }
    });
    /*动画模块*/
    mpi.fn.extend(mpi.fn,{
        //添加过度
        addTransition:function(attr,t){
            mpi.each(this,function(){
                    this.style.transition=attr+" linear "+t+"s";
                    this.style.webkitTransition=attr+" linear "+t+"s";
            })
            return this;
        },
        //删除过度
        removeTransition:function(){
            mpi.each(this,function(){
                this.style.transition="none";
                this.style.webkitTransition="none";
            })
            return this;
        }
    });
    /*css框架*/
    mpi.fn.extend(mpi.fn,{
        //设置或者获取css样式
        css:function(key,value){
            var doms=this;
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
            };
            return this;
        },
        //显示元素
        show:function (){
            this.css("display", "block");
            return this;
        },
        //隐藏元素
        hide:function (){
            this.css("display", "none");
            return this;
        },
        //元素高度宽度
        //元素的实际高度+border，也不包含滚动条
        Width:function (){
            return this[0].clientWidth;
        },
        Height:function (){
            return this[0].clientHeight
        },
        //元素的滚动高度和宽度
        //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
        scrollWidth:function (){
            return this[0].scrollWidth
        },
        scrollHeight:function (){
            return this[0].scrollHeight
        },
        //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
        //计算方式 scrollTop scrollLeft
        scrollTop:function (){
            return this[0].scrollTop
        },
        scrollLeft:function (id){
            return this[0].scrollLeft
        }

    });
    /*事件模块*/
    mpi.fn.extend(mpi.fn,{
        /*绑定事件*/
        on: function (type, fn) {
            this.each(function(){
                var dom=this;
                //如果支持
                //W3C版本 --火狐 谷歌 等大多数浏览器
                //如果你想检测对象是否支持某个属性，方法，可以通过这种方式
                if(dom.addEventListener) {
                    dom.addEventListener(type, fn, false);
                }else if(dom.attachEvent){
                    //如果支持 --IE
                    dom.attachEvent('on' + type, fn);
                }
            })
            return this;
        },
        /*取消绑定*/
        un:function(id, type, fn) {
            this.each(function(){
                var dom=this;
                if(dom.removeEventListener){
                    dom.removeEventListener(type, fn);
                }else if(dom.detachEvent){
                    dom.detachEvent(type, fn);
                }
            })
            return this;

        },
        //鼠标点击
        click:function(fn){
            this.on("click",fn);
        },
        //鼠标进入
        mouseover:function(fn){
            this.on("mouseover",fn);
        },
        //鼠标移出
        mouseout:function(fn){
            this.on("mouseout",fn);
        },
        //鼠标悬浮
        hover:function(fnOver,fnOut){
            if(fnOver){
                this.on("mouseover",fnOver);
                if(arguments.length==1){
                    this.on("mouseout",fnOver);
                }
            }
            if(fnOut){
                this.on("mouseout",fnOut);
            }
        }
    });



    // 让init的原型指向 jquery的原型使任何init的实例，都可以访问jq原型中的所有方法
    mpi.fn.init.prototype = mpi.fn;
    //暴露两个全局变量，可以访问mpi中的方法
    window.mpi = window.$$ = mpi;

})(window);

