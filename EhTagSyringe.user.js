// ==UserScript==
// @name        EhTagBuilder-test
// @name:zh-CN	E绅士标签构建者NEW
// @namespace   http://www.mapaler.com/
// @description Build EhTagTranslater from Wiki.
// @description:zh-CN	从Wiki获取EhTagTranslater数据库，将E绅士TAG翻译为中文
// @include     *://github.com/Mapaler/EhTagTranslator*
// @include     *://exhentai.org/*
// @include     *://e-hentai.org/*
// @connect     raw.githubusercontent.com
// @icon        http://exhentai.org/favicon.ico
// @require     http://cdn.static.runoob.com/libs/angular.js/1.4.6/angular.min.js
// @resource    template     https://raw.githubusercontent.com/xioxin/EhTagTranslator/new/template/etb-menu.html?6
// @version     2.7.1
// @run-at      document-start
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_info
// @grant       GM_getResourceText
// @grant       GM_addValueChangeListener
// @grant       GM_setClipboard
// @copyright	2017+, Mapaler <mapaler@163.com>
// ==/UserScript==


var template = GM_getResourceText('template');

window.requestAnimationFrame = unsafeWindow.requestAnimationFrame;

(function() {
    'use strict';

    var wiki_URL="https://github.com/Mapaler/EhTagTranslator/wiki"; //GitHub wiki 的地址
    var wiki_raw_URL="https://raw.githubusercontent.com/wiki/Mapaler/EhTagTranslator"; //GitHub wiki 的地址
    var rows_title="rows"; //行名的地址
    var pluginVersion =  '2.7.1';
    var rootScope = null;
    
    var defaultConfig = {
        'showDescription':true,
        'imageLimit':3,
        'showIcon':true,
        'syringe':true,
        'style':{
            'public':`div#taglist {
    overflow: visible;
    min-height: 295px;
    height: auto;
}
div#gmid {
    min-height: 330px;
    height:auto;
    position: static;
}
#taglist a{
  background:inherit;
}
#taglist a::before{
    font-size:12px;
    overflow: hidden;
    line-height: 20px;
    height: 20px;
}
#taglist a::after{
    display: block;
    color:#FF8E8E;
    font-size:14px;
    background: inherit;
    border: 1px solid #000;
    border-radius:5px;
    position:absolute;
    float: left;
    z-index:999;
    padding:8px;
    box-shadow: 3px 3px 10px #000;
    min-width:150px;
    max-width:500px;
    white-space:pre-wrap;
    opacity: 0;
    transition: opacity 0.2s;
    transform: translate(-50%,20px);
    top:0;
    left: 50%;
    pointer-events:none;
    padding-top: 8px;
    font-weight: 400;
    line-height: 20px;
}
#taglist a:hover::after,#taglist a:focus::after{
    opacity: 1;
    pointer-events:auto;
}
#taglist a:focus::before,
#taglist a:hover::before {
    font-size: 12px;
    position: relative;
    background-color: inherit;
    border: 1px solid #000;
    border-width: 1px 1px 0 1px;
    margin: -4px -5px;
    padding: 3px 4px;
    color:inherit;
    border-radius: 5px 5px 0 0;
}
div.gt,
div.gtw,
div.gtl{
    line-height: 20px;
    height: 20px;
}

#taglist a:hover::after{ z-index: 9999998; }
#taglist a:focus::after { z-index: 9999996; }
#taglist a:hover::before{ z-index: 9999999; }
#taglist a:focus::before { z-index: 9999997; }`,
            'ex':`#taglist a::after{ color:#fff; }`,
            'eh':`#taglist a::after{ color:#000; }`,
        }
    };

    var etbConfig = GM_getValue('etbConfig');
    if(etbConfig){
        etbConfig = JSON.parse(etbConfig);
    }else{
        /*默认配置*/
        etbConfig = JSON.parse(JSON.stringify(defaultConfig));
        GM_setValue('etbConfig',JSON.stringify(etbConfig));
    }


    //UI控制方法等等
    function EhTagBuilder(){
        console.log('EhTagBuilder');
        var buttonInserPlace = document.querySelector(".pagehead-actions")||document.querySelector("#nb"); //按钮插入位置
        var li = document.createElement("li");
        li.id = 'etb';
        li.setAttribute('ng-csp','ng-csp');
        li.innerHTML = template;
        var app = angular.module("etb",[]);
        app.controller("etb",function($rootScope,$scope){
            $scope.pluginVersion = pluginVersion;

            $scope.config = etbConfig;

            $scope.nowPage = "menu";
            $scope.menuShow = false;
            rootScope = $rootScope;
            $scope.dataset = false;
            $scope.wikiVersion = false;
            //xx时间前转换方法
            $scope.timetime = function (time) {
                if(!time){
                    return '';
                }
                var now = (new Date).valueOf();
                now = Math.floor(now/1000);
                time = Math.floor(time/1000);
                var t =  now-time;

                if(!t){
                    return '刚刚';
                }
                var f = [
                    [31536000,'年'],
                    [2592000,'个月'],
                    [604800,'星期'],
                    [86400,'天'],
                    [3600,'小时'],
                    [60,'分钟'],
                    [1,'秒']
                ];
                var c = 0;
                for(var i in f){
                    var k = f[i][0];
                    var v = f[i][1];
                    c = Math.floor(t/k);
                    if (0 != c) {
                        return c+v+'前';
                    }
                }
            };
            //打开菜单按钮
            $scope.openMenu = function () {
                $scope.nowPage = "menu";
                $scope.menuShow = true;
            };
            //关闭菜单按钮
            $scope.closeMenu = function () {
                $scope.menuShow = false;
            };
            //开始获取
            $scope.startProgram = async function () {
                $scope.nowPage = "getData";
                await startProgram($scope);
                //增加一个延迟 因为处理css时候会卡住 导致加载完毕的ui无法显示
                setTimeout(function(){
                    var css = buildCSS($scope.dataset,$scope.wikiVersion);
                    // 存储
                    $scope.css     = css;
                    $scope.cssStylish = buildStylishCSS(css,$scope.config);
                    $scope.nowPage = 'css';
                    $scope.$apply();
                },0);
            };
            //存储css样式
            $scope.saveCss = function () {
                GM_setValue('css',{
                    data:$scope.css,
                    version:$scope.wikiVersion
                });
            };

            $scope.copyStylishCss = function () {
                GM_setClipboard($scope.cssStylish)
            };
            $scope.copyCss = function () {
                GM_setClipboard($scope.css)
            };

            //打开设置界面
            $scope.openOption = function () {
                $scope.nowPage = "option";
            };
            //保存设置
            $scope.optionSave = function () {
                GM_setValue('etbConfig',JSON.stringify(etbConfig));
            };
            //重置设置
            $scope.optionReset = function () {
                $scope.config = etbConfig = JSON.parse(JSON.stringify(defaultConfig));
                GM_setValue('etbConfig',JSON.stringify(etbConfig));
            };

            unsafeWindow.r = function () {
                $scope.$apply();
            };
        });
        angular.bootstrap(li,['etb']);
        unsafeWindow.etbApp = app;
        buttonInserPlace.insertBefore(li,buttonInserPlace.querySelector("li"));
    }

    //样式写入方法
    function EhTagSyringe(){

    }

    //EH站更新提示
    function EhTagUpdate() {

    }

    //获取数据
    async function startProgram($scope) {
        console.log('startProgram');

        //存放承诺
        var pp = {
            wikiVersion:getWikiVersion(),
            rows:getRows(),
            tags:[]
        };

        //获取 版本与row
        var [wikiVersion,rows] = await Promise.all([pp.wikiVersion,pp.rows]);

        $scope.dataset = rows;
        $scope.wikiVersion = wikiVersion;
        $scope.$apply();

        //构建获取tag任务 并执行

        rows.forEach(function (row) {
            var temp = getTags(row.name);
            temp.then(function (mdText) {
                row.tags = parseTable(mdText);
                $scope.$apply();
            });
            pp.tags.push(temp);
        });

        //等待获取完毕
        await Promise.all(pp.tags);
        console.log(rows);

        return rows;
    }

    //构建css
    function buildCSS(dataset,wikiVersion) {
        console.time('生成css样式');
        var css = "";

        css+=`
/* update_time:${wikiVersion.update_time} */
/* hash:${wikiVersion.code} */
        `;

        dataset.forEach(function (row) {
            css+= `\n/* ${row.name} ${row.cname} */\n`;
            row.tags.forEach(function (tag) {
                if(tag.name){
                    var tagid = (row.name=="misc"?"":row.name + ":") + tag.name.replace(/\s/ig,"_");
                    var cname = mdImg2cssImg(specialCharToCss(tag.cname),etbConfig.imageLimit);
                    var content = mdImg2cssImg(htmlBr2cssBr(specialCharToCss(tag.cname)),etbConfig.imageLimit);
                    css += `
a[id="ta_${tagid}"]{
font-size:0px;
}
a[id="ta_${tagid}"]::before{
content:"${cname}";
}
a[id="ta_${tagid}"]::after{
content:"${content}";
}
`;
                }else{
                    css += `\n/* ${row.cname} */\n`;
                }
            });
        });
        console.timeEnd('生成css样式');
        return css;

    }

    //Stylish css
    function buildStylishCSS(css,config) {
        var cssStylish = "@namespace url(http://www.w3.org/1999/xhtml);\n";

        cssStylish+=`@-moz-document
    domain('exhentai.org'),
    domain('e-hentai.org')
{
/* 通用样式 */
${config.style.public}
}
`;
        cssStylish+=`@-moz-document
    domain('e-hentai.org')
{
/* 表站样式 */
${config.style.eh}
}
`;
        cssStylish+=`@-moz-document
    domain('exhentai.org')
{
/* 里站样式 */
${config.style.ex}
}
`;

        cssStylish+=`@-moz-document
    domain('exhentai.org'),
    domain('e-hentai.org')
{
body{ }
/* 翻译样式 */
${css}
}`;
        return cssStylish;
    }


    //转换换行
    function htmlBr2cssBr(mdText){
        return mdText.replace(/<br[ \t]*(\/)?>/igm,"\\A ");
    }

    //转换图片
    function mdImg2cssImg(mdText,max=Infinity){
        var n = 0;
        return mdText.replace(/\!\[(.*?)\]\((.*?)\)/igm,function (text,alt,href,index) {
            n++;
            if( max >= n){
                var h = trim(href);
                if(h.slice(0,1) == "#"){
                    h = h.replace(/# +\\?['"](.*?)\\?['"]/igm,"$1");
                }else if(h.slice(h.length-1,h.length).toLowerCase() == 'h'){
                    h = h.slice(0,-1);
                }
                return `"url("${h}")"`;
            }
        });
    }

    function specialCharToCss(str)
    {
        var strn = str;
        strn = strn.replace("\\","\\\\");
        strn = strn.replace("\"","\\\"");
        strn = strn.replace("\r","");
        strn = strn.replace("\n","\\A ");
        return strn;
    }

    //获取版本
    function getWikiVersion(){
        return new Promise(function (resolve, reject) {
            PromiseRequest.get(wiki_URL+'/_history').then(function (response) {
                var parser = new DOMParser();
                var PageDOM = parser.parseFromString(response, "text/html");
                var lastDOM = PageDOM.querySelector('#version-form  table  tr:nth-child(1)');
                if(!lastDOM){
                    reject();
                    return;
                }
                var code = "";
                var time = 0;
                var commit = "";

                var timeDOM = lastDOM.querySelector(".date relative-time");
                if(timeDOM)time = Date.parse(new Date(timeDOM.getAttribute('datetime')));

                var codeDOM = lastDOM.querySelector(".commit-meta code");
                if(codeDOM)code = codeDOM.innerText.replace(/(^\s*)|(\s*$)/g, "");

                var commitDOM = lastDOM.querySelector(".commit code");
                if(commitDOM)commit = commitDOM.innerText.replace(/(^\s*)|(\s*$)/g, "");

                var v = {
                    update_time:time,
                    code:code,
                    commit:commit
                };
                resolve(v);
            },function () {
                reject();
            });
        });
    }

    //去除两端空白
    function trim(s){
        if(typeof s == 'string'){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }else{
            return s;
        }
    }

    //获取行 并解析
    function getRows() {
        return new Promise(async function (resolve, reject) {
            var url = `${wiki_raw_URL}/${rows_title}.md`;
            console.log(url);
            var data = await PromiseRequest.get(url);
            /*剔除表格以外的内容*/
            var re = (/^\|.*\|$/gm);
            var table = "";
            resolve( parseTable(data) );
        });
    }

    //获取标签 并解析
    function getTags(row) {
        return new Promise(async function (resolve, reject) {

            var url = `${wiki_raw_URL}/tags/${row}.md`;
            console.log(url);
            console.time(`加载 ${row}`);
            var data = await PromiseRequest.get(url);
            console.timeEnd(`加载 ${row}`);
            resolve(data);
        });
    }

    function parseTable(data) {
        /*剔除表格以外的内容*/
        var re = (/^\|.*\|$/gm);
        var table = "";
        var temp = "";
        while( temp = re.exec(data) ){
            if(table)table+="\n";
            table+=temp[0];
        }
        table = table.replace(/\\\|/igm,"{~Line~}");
        let tableArr = table.split("\n").map(
            (row)=>row.split("|").map(
                (t)=>t.replace("{~Line~}","|")
            )
        );

        let tags = [];
        tableArr.forEach(function (tr,index) {
            if(index>1){
                tags.push({
                    name  : trim(tr[1]||""),
                    cname : trim(tr[2]||""),
                    info  : trim(tr[3]||"")
                });
            }
        });
        return tags;
    }




    //承诺封装的异步请求
    function PromiseRequest(option) {
        return new Promise(function (resolve, reject) {
            option.onload = function (response) {
                resolve(response.responseText);
            };
            option.onerror = function (response) {
                reject(response);
            };
            // if(rootScope && rootScope.$broadcast){
            //
            // }
            // option.onprogress = function (response,response2) {
            //     // var info = {
            //     //     loaded:response.loaded,
            //     //     position:response.position,
            //     //     total:response.total,
            //     //     totalSize:response.totalSize,
            //     // };
            //     // console.info('onprogress',info,response,response2);
            // };
            GM_xmlhttpRequest(option);
        });
    }
    //助手 快速get post
    PromiseRequest.get = function (url) {
        return PromiseRequest({
            method: "GET",
            url: url,
        });
    };
    PromiseRequest.post = function (url,data) {
        var post = "";
        for(var i in data){
            if(post)post+="&";
            post+= encodeURIComponent(i)+"="+encodeURIComponent(data[i]);
        }
        return PromiseRequest({
            method: "POST",
            url: url,
            data: post
        });
    };

    var bootstrap = function(){
        if (window.document.readyState === "complete") {
            //在github页面下添加生成工具
            if((/github\.com/).test(unsafeWindow.location.href)){
                EhTagBuilder();
            }
            //在EH站点下添加版本提示功能
            if((/(exhentai\.org|e-hentai\.org)/).test(unsafeWindow.location.href)){
                //EhTagVersion();
            }
        }
    };
    if(window.document.readyState === "complete"){
        bootstrap();
    }else{
        document.addEventListener('readystatechange', bootstrap, false);
    }

})();