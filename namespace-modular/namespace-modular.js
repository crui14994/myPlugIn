//定义一个对象 - 名字是mpi
/*z只是展示思路，内部一些模块调用还需修改*/
(function(window){

    var mpi ={};

    /*公共模块*/
    mpi.common={
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
        }
    }

    /*字符串操作模块*/
    mpi.changeString={
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
    }
    /*类型判断模块*/
    mpi.isType={
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
    }
    /*事件模块*/
    mpi.enevt={
        on: function (id, type, fn) {
            //var dom = document.getElementById(id);
            var dom = mpi.isType.isString(id)?document.getElementById(id):id;
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
            var dom = mpi.isType.isString(id)?document.getElementById(id):id;
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
    }

    /*ui模块*/
    mpi.ui={}
    mpi.ui.pc={}
    mpi.ui.mobile={}

    /*通过全局变量$$将匿名函数变量mpi设置为全局变量*/
    window.$$=mpi;

})(window);

