

var Mock = [
    {element:'轮播',id:'2',pid:'1'},
    {element:'轮播小图',id:'3',pid:'2'},
    {element:'首页',id:'1',pid:'0'},
    {element:'轮播大图',id:'4',pid:'2'},
    {element:'产品',id:'5',pid:'0'},
    {element:'蔬菜',id:'6',pid:'5'},
    {element:'有机蔬菜',id:'7',pid:'6'},
    {element:'无机蔬菜',id:'8',pid:'6'},
    {element:'水果',id:'9',pid:'5'},
    {element:'有机水果',id:'10',pid:'9'},
    {element:'有机大水果',id:'11',pid:'10'},
    {element:'有机小水果',id:'12',pid:'10'},
    {element:'无机水果',id:'13',pid:'9'},
];

/**
 * @Author    Toney
 * @Explain   [树形插件]
 * @DateTime  2017-01-28
 * @copyright [datacvg]
 * @param     {[type]}      root_id [description]
 */
var PTree = function(root_id){

    var _this = this;

    //存放根据pid找到的节点
    this.stack = [];
    //原始json数据
    this.json = null;
    //存放json转化后的数据模型
    this.nodes = [];

    this.root = document.getElementById(root_id);
    //字段
    _this.keys = [];

    //缓存dom
    this.dom = {};
    //当前选中的节点
    this.selectedNode = '';


    //获取最大json  id
    this.getMaxId = function(){
        var json = this.json.concat();
        json.sort(function(a,b){
            return b.id - a.id;
        });
        return json[0]['id'];
    }
    /**
     * @Author    Toney
     * @Explain   [获取包含自身的子元素]
     * @DateTime  2017-01-29
     * @copyright [datacvg]
     * @param     {[type]}      parent [description]
     * @return    {[type]}             [description]
     */
    this.outChildrenNode = function(parent){
        var result = [parent];
        var childs = parent.getElementsByTagName('i');
        for(var i = 0; i < childs.length; i++){
            var curNode = childs[i];
            if(curNode){
                result.push(curNode);
            }
        }
        return result;
    }   
    /**
     * @Author    Toney
     * @Explain   [按照json数据的key初始化一条空的json数据]
     * @DateTime  2017-01-29
     * @copyright [datacvg]
     * @return    {[type]}      [description]
     */
    this.initItem = function(){
        var o = {};
        while(_this.keys.length){
            o[_this.keys.pop()] = null;
        }
        return o;
    }
    /**
     * @Author    Toney
     * @Explain   [视图转化为model]
     * @DateTime  2017-01-29
     * @copyright [datacvg]
     * @param     {[type]}      nodes [description]
     * @return    {[type]}            [description]
     */
    this.viewToModel = function(nodes){
        var json = [];
        var temp = this.initItem();
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];
            var item = (function(){
                var result = {};
                for(key in temp){
                    result[key] = temp[key];
                }
                return result;
            })();
            for(var key in item){
                item[key] = node.getAttribute(key);
            }     
            json.push(item);    
        }
        return json;
    }
    /**
     * @Author    Toney
     * @Explain   [更新model]
     * @DateTime  2017-01-28
     * @copyright [datacvg]
     * @param     {[string]}      id    [id主键]
     * @param     {[string]}      field [待更新的字段]
     * @param     {[string]}      val   [修改后的值]
     */
    this.updateModel = function(id,field,val){
        for(var i = 0 ; i < this.json.length ; i++){
            var item = this.json[i];
            if(item['id'] == id){
                this.json[i][field] = val;
            }
        }
        console.log(this.json);
    }
    this.addModel = function(item){
        this.json.push(item);
    }   
    this.removeModel = function(id){
        for(var i = 0; i < _this.json.length;i++){
            var item = _this.json[i];
            if(item['id'] == id){
                _this.json.splice(i,1);
            }
        }
    }
    //刷新视图
    this.reRender = function(){
        this.init();
        this.removeAllNode();
        this.initTree(this.json);
    }
    //初始化所有初始变量
    this.init = function(){
        //存放根据pid找到的节点
        this.stack = [];
     
        //存放json转化后的数据模型
        this.nodes = [];
        //缓存dom
        this.dom = {};
    }
    //清空所有节点
    this.removeAllNode = function(){
        var childs=this.root.childNodes;    
        for(var i=childs.length-1;i>=0;i--){    
            this.root.removeChild(childs.item(i));
        }
    }
    //右键菜单
    this.panelMenu = {
        dom:{
            panel:null,
        },
        pos:{
            x:null,
            y:null
        },
        list:[
            {name:'添加',cmd:'add'},
            {name:'删除',cmd:'remove'},
            {name:'重命名',cmd:'rename'},
            {name:'复制',cmd:'copy'},
            {name:'粘贴',cmd:'paste'}
            ],
        strategy:{
            dom:{
                target:null
            },
            json:{
                copy:null
            },
            add:function(item){
                console.log('this is add');
                //初始化一条数据
                var _item = item || _this.initItem();
                _item.id = _item.id || (parseInt(_this.getMaxId()) + 1).toString();
                _item.pid = _item.pid || this.dom.target.getAttribute('id');
                _item.element = _item.element || '新的节点';
                _this.addModel(_item);
                _this.reRender();
                this.dom.target = _this.findNode(_item.id);
                !item?this.rename():null;

            },
            remove:function(){
                console.log('this is remove');
                _this.removeModel(this.dom.target.getAttribute('id'));
                _this.reRender();
            },
            rename:function(){
                console.log('this is rename');
                var input = {
                    dom:{
                        input:null
                    },
                    initInput:function(){
                        var input = document.createElement('input');
                        input.setAttribute('type','text');
                        input.setAttribute('size','10');
                        input.setAttribute('style','position: absolute;left: 0;top:0;height: 12px;');
                        this.dom.input = this.dom.input || input;
                        this.listen({
                            onBlur:function(me,e){
                                var target = _this.panelMenu.strategy.dom.target;
                                var rename = me.value;
                                if(rename){
                                    _this.updateModel(target.getAttribute('id'),'element',rename);
                                    _this.reRender();
                                }
                                input.remove();
                                
                                console.log('after rename',_this.json);
                            }
                        });
                    },
                    listen:function(config){
                        this.dom.input.addEventListener('blur',function(e){
                            e?e.stopPropagation():window.event.cancelBubble = true;
                            config.onBlur(this,e);
                        });
                        this.dom.input.addEventListener('click',function(e){
                            e?e.stopPropagation():window.event.cancelBubble = true;
                        });
                    },
                    appendTo:function(parent){
                        _this.add(this.dom.input,parent);
                    },
                    remove:function(){
                        if(this.dom.input && this.dom.input.parentNode){
                            this.dom.input.parentNode.removeChild(this.dom.input);
                        }
                    },
                    focus:function(){
                        this.dom.input.focus();
                    }  
                };
                input.initInput();
                input.appendTo(this.dom.target);
                input.focus();
            },
            copy:function(){
                console.log('this is copy');
                this.dom.copy = this.dom.copy || this.dom.target;
                var outChildren = _this.outChildrenNode(this.dom.target);
                var model = _this.viewToModel(outChildren);
                this.json.copy = model;
            },
            paste:function(){
                console.log('this is paste');
                var origin_id = this.json.copy[0]['id'];
                var max_id = parseInt(_this.getMaxId()) + 1;
                var minus = max_id - parseInt(origin_id);
                for(var i = 0; i < this.json.copy.length; i++){
                    this.json.copy[i]['id'] = parseInt(this.json.copy[i]['id']) + minus;
                    this.json.copy[i]['pid'] = parseInt(this.json.copy[i]['pid']) + minus;
                }
                this.json.copy[0]['pid'] = this.dom.target.getAttribute('id');
                _this.json = _this.json.concat(this.json.copy);
                _this.reRender();
            }
        },
        initPanel:function(){
            if(!this.dom.panel){
                var __this = this;
                this.dom.panel = (function(){
                    var panel = document.createElement('div');
                    var style = "background:black;opacity:0.9;color:white;cursor:pointer;text-align:center;background:gray;width:200px;height:auto;position:fixed;left:10px;top:10px";
                    panel.setAttribute('style',style);
                    //菜单项
                    (function(){
                        for(var i = 0; i < __this.list.length;i++){
                            var item = __this.list[i];
                            var p = document.createElement('p');
                            p.innerHTML = item['name'];
                            panel.appendChild(p);
                            (function(p,item){
                                p.addEventListener('click',function(e){
                                    __this.strategy[item['cmd']]();
                                });
                            })(p,item);
                        }
                    })();
                    return panel;
                })();
            }
        },   
        open:function(e){
            //初始化一个菜单面板
            this.initPanel();
            //设置初始位置为光标位置
            this.dom.panel.style.left = e.clientX+'px';
            this.dom.panel.style.top = e.clientY+'px';
        },
        close:function(){
            if(this.dom.panel && this.dom.panel.parentNode){
                this.dom.panel.parentNode.removeChild(this.dom.panel);
            }
        }
    };
    /**
     * @Author    Toney
     * @Explain   [根据一项json数据创建一个节点，key->value设置为节点的属性]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      item [description]
     * @return    {[type]}           [description]
     */
    this.createNode = function(item){
        var node = document.createElement('i');
        var span  = document.createElement('span');
        span.innerHTML = item['element'];
        for(var key in item){
            node.setAttribute(key,item[key]);
        }
        node.append(span);
        //其他属性
        node.setAttribute('open','yes');
        node.setAttribute('class','icon-minus');
        return node;
    }
    /**
     * @Author    Toney
     * @Explain   [description]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      child  [description]
     * @param     {[type]}      parent [description]
     */
    this.add = function(child,parent){
        parent.appendChild(child);
    }
    /**
     * @Author    Toney
     * @Explain   [入栈根据pid找到的节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      pid [description]
     * @return    {[type]}          [description]
     */
    this.pushFoundChild = function(pid){
        for(var i = 0; i < this.nodes.length; i++){
            var node = this.nodes[i];
            if(node.getAttribute('pid') == pid){
                this.stack.push(node);
            }
        }
        return this.stack.length;
    }
    /**
     * @Author    Toney
     * @Explain   [获取当前节点的父节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      pid [description]
     * @return    {[type]}          [description]
     */
    this.findParent = function(pid){
        if(pid == 0){
            return this.root;
        }
        for(var i = 0; i < this.nodes.length; i++){
            var node = this.nodes[i];
            if(node.getAttribute('id') == pid){
                return node;
            }
        }
        return null;
    }
    /**
     * @Author    Toney
     * @Explain   [获取某个节点]
     * @DateTime  2017-01-29
     * @copyright [datacvg]
     * @param     {[type]}      id [description]
     * @return    {[type]}         [description]
     */
    this.findNode = function(id){
        for(var i = 0; i < this.nodes.length; i++){
            var node = this.nodes[i];
            if(node.getAttribute('id') == id){
                return node;
            }
        }
        return null;
    }
    /**
     * @Author    Toney
     * @Explain   [把json数据转化为一个个节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      json [description]
     * @return    {[type]}           [description]
     */
    this.initNodes = function(json){
        if(json.length > 0){
            for(var i = 0 ; i < json.length ; i++){
                var item = json[i];     
                var node = this.createNode(item);  
                this.nodes.push(node);
            }
        }else{
            throw '传入的Json串不合法';
        }
    };
    /**
     * @Author    Toney
     * @Explain   [监听所有I节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      config [description]
     * @return    {[type]}             [description]
     */
    this.listenI = function(config){
 
        var cfg = {
            onclick:function(){},
            onMouseDown:function(){}
        };
        //深度继承
        for(var key in config){
            cfg[key] = config[key];
        }
        this.dom.i = this.dom.i || this.root.getElementsByTagName('i');
        for(var i = 0; i < this.dom.i.length; i++){
            var item = this.dom.i[i];
            (function(item){
                item.addEventListener('click',function(e){
                    e?e.stopPropagation():window.event.cancelBubble = true;
                    cfg.onclick(this,e);
                });
                item.addEventListener('mousedown',function(e){
                    e?e.stopPropagation():window.event.cancelBubble = true;
                    cfg.onMouseDown(this,e);
                });
            })(item);
        }
   
    }
    // this.openMenu = function(e){
    //     this.panelMenu.open(e);
    //     this.root.appendChild(this.panelMenu.dom.panel);
    // },
    /**
     * @Author    Toney
     * @Explain   [判断某个节点是否为展开状态]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @param     {[type]}      node [description]
     * @return    {Boolean}          [description]
     */
    this.isOpen = function(node){
        if(node.getAttribute('open') == 'yes'){
            return true;
        }else{
            return false;
        }
    }
    /**
     * @Author    Toney
     * @Explain   [展开一个节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @return    {[type]}      [description]
     */
    this.openNode = function(node){
        //设置状态为展开
        node.setAttribute('open','yes');
        //设置图标为减号
        node.setAttribute('class','icon-minus');
        var children = node.getElementsByTagName('i');            
        for(var i = 0; i < children.length;i++){
            var item = children[i];
            item.style.display = 'block';
        }   
    }
    /**
     * @Author    Toney
     * @Explain   [折叠一个节点]
     * @DateTime  2017-01-24
     * @copyright [datacvg]
     * @return    {[type]}      [description]
     */
    this.closeNode = function(node){
        //设置状态为关闭
        node.setAttribute('open','no');
        //设置图标为加号
        node.setAttribute('class','icon-add');
        var children = node.getElementsByTagName('i');
        for(var i = 0; i < children.length;i++){
            var item = children[i];
            item.style.display = 'none';
        }   
    }
    this.listenRoot = function(){
        this.root.addEventListener('click',function(e){
            var target = e.target;
            if(target != 'p'){
                _this.panelMenu.close();
            }
        });
    }
    this.getDeepth = function(me){
        var deepth = 0;
        var pid = me.getAttribute('pid');
        while(pid!=0){
            for(var i = 0; i< _this.json.length; i++){
                if(_this.json[i].id == pid){
                    deepth++;
                    pid = _this.json[i].pid;
                    break;
                }
            }
        }
        return deepth;
    }
    this.initListen = function(){
        this.listenI({
            onclick:function(me){
                _this.dom.i =  _this.dom.i || _this.root.getElementsByTagName('i');
                for(var i = 0; i < _this.dom.i.length; i++){
                    var span = _this.dom.i[i].firstChild;
                    var className = span.className;
                    if(className&&className.indexOf('checked') >= 0){
                        className = className.replace(/checked/,'');
                    }
                    span.className = className;
                }
                // console.log(_this.nodes);
                // console.log(_this.stack)
                // console.log(_this.dom)
                var deepth = _this.getDeepth(me);
                //console.log(deepth);
                var curClassName = me.firstChild.className+ ' checked';
                me.firstChild.className=curClassName;
                me.firstChild.style.marginLeft = (-deepth*20) + 'px';
                me.firstChild.style.paddingLeft = (deepth*20) + 'px';
                _this.selectedNode = me;
            },
            // onMouseDown:function(me,e){ 
            //     _this.panelMenu.strategy.dom.target = me;
            //     switch(e.button){
            //         case 2:
            //             _this.openMenu(e);
            //             break;
            //     }
            // }
        });
        this.listenRoot();
    }
    this.initKeys = function(json){
        for(var key in json[0]){
            this.keys.push(key);
        }
    }
    this.testMock = function(num){
        var start = new Date().getTime();//起始时间

     
        for(var i = 0; i < num; i++){
            var item = {
                pid:0,
                id:null,
                element:'dskljfkdsl'
            };
            this.json.push(item);
        }
        this.reRender();
        var end = new Date().getTime();//接受时间
         
        return (end - start)+"ms";//返回函数执行需要时间
    }
    /**
     * 添加新节点
     * @type {[type]}
     */
    this.createNewItem = function(){
        var node = document.createElement('i');
        var p = document.createElement('p');
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        p.appendChild(input);
        node.appendChild(p);
        return node;
    }
    // //禁止浏览器默认鼠标右键
    // this.forbidBrowserMouseRightKey = function(){
    //     window.oncontextmenu = function(){
    //         window.event.returnValue=false;
    //         return false;
    //     }
    // }
};
/**
 * @Author    Toney
 * @Explain   [把节点拼成树]
 * @DateTime  2017-01-24
 * @copyright [datacvg]
 * @return    {[type]}      [description]
 */
PTree.prototype.initTree = function(json){
    this.json = json;
    this.initNodes(json);
    this.initKeys(json);
    var pid = 0,
    curNode = null,
    parent = null;
   // console.log(this.nodes);
    while(this.pushFoundChild(pid)){
        curNode = this.stack.pop();
        parent = this.findParent(curNode.getAttribute('pid'));     
        this.add(curNode,parent);
        pid = curNode.getAttribute('id');
    }
    this.initListen();
    //this.forbidBrowserMouseRightKey();
}
PTree.prototype.addItem = function(){
    var selected = this.selectedNode;
    console.log(selected);
    if(selected){
        this.add(this.createNewItem(), selected);
    }

}
var pTree = new PTree('panel-tree');
pTree.initTree(Mock);

$('#add_btn').click(function(){
    pTree.addItem();
})

let f = ()=>{
    return new Promise(resolve=>{
        $.getJSON('/ke/eyp/web/expindex/findSumAnswerAndItem',res=>{
            console.log(res.data.sumExpert);
            resolve(res.data.sumExpert);
        })
    })
}
// f().then(res=>{
//     console.log(res);
// })

async function g(){
    return await f();
}
g().then(v=>{
    console.log(v)
})
