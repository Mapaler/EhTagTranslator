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
// @require     https://raw.githubusercontent.com/brrd/celldown.js/master/dist/celldown.js
// @require     https://raw.githubusercontent.com/xioxin/EhTagTranslator/new/lexer/md_table.js
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
// @copyright	2017+, Mapaler <mapaler@163.com>
// ==/UserScript==


var template = `<div class="select-menu js-menu-container js-select-menu " ng-class="{active:menuShow}" ng-controller="etb">
    <a href="#" ng-click="openMenu()" class="btn btn-sm btn-with-count js-toggler-target">
        <span class="js-select-button">
            <svg class="octicon" style="margin:2px 2px;" width="12" height="12" viewBox="0 0 180 180" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="EH" fill="#000000" transform="translate(0.000000, 13.000000)">
                    <polygon id="Path-2"
                             points="0 0.202883984 0 153.452455 63.9237403 153.452455 63.9237403 128.434878 25.3357783 128.434878 25.3357783 89.8192926 51.0881973 89.8192926 51.0881973 64.4842269 25.815364 64.4842269 25.815364 26.0161147 63.9458219 26.0161147 63.9458219 0"></polygon>
                    <polygon id="Path-3"
                             points="102.413793 0.499934441 102.413793 153.799341 128.267497 153.799341 128.267497 89.8145927 153.883139 89.8145927 153.883139 153.360711 179.611922 153.360711 179.611922 0 154.060738 0 154.060738 63.8323757 128.389266 63.8323757 128.389266 0.125830495"></polygon>
                    <rect id="Rectangle" x="63.6206897" y="64.9220339" width="26.3793103" height="26.2779661"></rect>
                </g>
            </svg>
            EhTagBuilder
        </span>
    </a>
    <a class="social-count js-social-count" href="#">
        {{pluginVersion}}
    </a>
    <div class="select-menu-modal-holder">
        <div class="select-menu-modal js-menu-content">
            <div ng-if="nowPage == 'menu'">
                <div class="select-menu-header" ng-click="closeMenu()">
                    <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1"
                         viewBox="0 0 12 16" width="12">
                        <path fill-rule="evenodd"
                              d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"/>
                    </svg>
                    <span class="select-menu-title">请选择任务 v{{pluginVersion}}</span>
                </div>
                <div class="select-menu-list js-navigation-container">
                    <div ng-click="startProgram()" class="select-menu-item js-navigation-item ">
                        <svg width="16" height="16" class="octicon octicon-question select-menu-item-icon"
                             viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7559"
                             xmlns:xlink="http://www.w3.org/1999/xlink">
                            <path d="M157.142857 73.142857h860l-152 761.714286-459.428571 152.571428-398.857143-152.571428 40.571428-203.428572h169.714286l-16.571428 84 241.142857 92 277.714285-92 38.857143-193.714285H68l33.142857-169.714286h690.857143l21.714286-109.142857H123.428571z"
                                  fill="#000000"></path>
                        </svg>
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">生成CSS</span>
                            <span class="description">生成用户样式版EhTagTranslator，请使用Stylish扩展安装。理论上安卓火狐也可使用。</span>
                        </div>
                    </div>
                    <div class="select-menu-item js-navigation-item ">
                        <svg width="16" height="16" class="octicon octicon-question select-menu-item-icon"
                             xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                             viewBox="0 0 200 200">
                            <defs>
                                <style>.a {
                                    fill: url(#a);
                                }

                                .b {
                                    fill: url(#b);
                                }</style>
                                <linearGradient id="a" x1="-203.55" y1="494.39" x2="-203.01" y2="493.62"
                                                gradientTransform="matrix(165, 0, 0, -200.09, 33655.16, 98947.72)"
                                                gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stop-opacity="0.2"/>
                                    <stop offset="1"/>
                                </linearGradient>
                                <linearGradient id="b" x1="133.87" y1="179.42" x2="41.19" y2="18.9"
                                                gradientTransform="matrix(1, 0, 0, 1, 0, 0)" xlink:href="#a"/>
                            </defs>
                            <title>Group2</title>
                            <path class="a"
                                  d="M100,51.82c-29.25-10.12-65,14-65,62.49C34.75,192.92,93.13,200,100,200a100.87,100.87,0,0,0,100-100A100.74,100.74,0,0,0,100,.08c12.5-1.62,65.63,13.12,65.63,86.24,0,47.62-40,73.61-65.87,62.49a50.74,50.74,0,0,1-29.12-48.74A51.24,51.24,0,0,1,100,51.82Z"
                                  transform="translate(0 0.04)"/>
                            <path class="b"
                                  d="M35,114.37C35,70.08,64.81,46.14,92.27,50A39.75,39.75,0,0,1,100,51.82a50.74,50.74,0,0,1,29.13,48.24A51,51,0,0,1,100,148.93l0,0c25.88,10.81,65.59-15.16,65.59-62.61,0-61.66-37.78-81.81-57.11-85.63-1.35-.2-2.67-.36-4-.46C103,.2,101.53.14,100,.13l.49-.05H100a100.87,100.87,0,0,0-100,100A100.74,100.74,0,0,0,98.2,200C86.25,199,34.77,188.21,35,114.37Z"
                                  transform="translate(0 0.04)"/>
                        </svg>
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">生成JS</span>
                            <span class="description">生成用户样式版EhTagTranslator，请使用Stylish扩展安装。理论上安卓火狐也可使用。</span>
                        </div>
                    </div>
                </div>
                <div class="select-menu-list js-navigation-container">
                    <div ng-click="openOption()" class="select-menu-item select-menu-action">
                        <svg width="14" viewBox="0 0 14 16" version="1.1" height="16"
                             class="octicon octicon-question select-menu-item-icon" aria-hidden="true">
                            <path d="M14 8.77V7.17l-1.94-0.64-0.45-1.09 0.88-1.84-1.13-1.13-1.81 0.91-1.09-0.45-0.69-1.92H6.17l-0.63 1.94-1.11 0.45-1.84-0.88-1.13 1.13 0.91 1.81-0.45 1.09L0 7.23v1.59l1.94 0.64 0.45 1.09-0.88 1.84 1.13 1.13 1.81-0.91 1.09 0.45 0.69 1.92h1.59l0.63-1.94 1.11-0.45 1.84 0.88 1.13-1.13-0.92-1.81 0.47-1.09 1.92-0.69zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path>
                        </svg>
                        <div class="select-menu-item-text">选项</div>
                    </div>
                    <a target="_blank" href="https://github.com/Mapaler/EhTagTranslator/wiki"
                       class="select-menu-item select-menu-action">
                        <svg width="16" viewBox="0 0 16 16" version="1.1" height="16"
                             class="octicon octicon-book select-menu-item-icon" aria-hidden="true">
                            <path d="M2 5h4v1H2v-1z m0 3h4v-1H2v1z m0 2h4v-1H2v1z m11-5H9v1h4v-1z m0 2H9v1h4v-1z m0 2H9v1h4v-1z m2-6v9c0 0.55-0.45 1-1 1H8.5l-1 1-1-1H1c-0.55 0-1-0.45-1-1V3c0-0.55 0.45-1 1-1h5.5l1 1 1-1h5.5c0.55 0 1 0.45 1 1z m-8 0.5l-0.5-0.5H1v9h6V3.5z m7-0.5H8.5l-0.5 0.5v8.5h6V3z"></path>
                        </svg>
                        <div class="select-menu-item-text">参与补全翻译</div>
                    </a>
                </div>
            </div>
            <div ng-if="nowPage == 'option' ">
                <div class="select-menu-header" ng-click="closeMenu()">
                    <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1"
                         viewBox="0 0 12 16" width="12">
                        <path fill-rule="evenodd"
                              d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"/>
                    </svg>
                    <span class="select-menu-title">EhTagBuilder 设置</span>
                </div>
                <div class="select-menu-list js-navigation-container">
                    <label for="ETB_create-info" class="select-menu-item"><input type="checkbox" id="ETB_create-info"
                                                                                 name="ETB_create-info"
                                                                                 class="octicon octicon-question select-menu-item-icon ETB_create-info">
                        <div class="select-menu-item-text"><span class="select-menu-item-heading">生成简介</span><span
                                class="description">生成光标移动到Tag上时出现的简介。</span></div>
                    </label><label for="ETB_create-info-image" class="select-menu-item"><input type="checkbox"
                                                                                               id="ETB_create-info-image"
                                                                                               name="ETB_create-info-image"
                                                                                               class="octicon octicon-question select-menu-item-icon ETB_create-info-image">
                    <div class="select-menu-item-text"><span class="select-menu-item-heading">生成简介图片和Emoji</span><span
                            class="description">生成简介中的图片和绘文字。</span></div>
                </label><label for="ETB_create-cname-image" class="select-menu-item"><input type="checkbox"
                                                                                            id="ETB_create-cname-image"
                                                                                            name="ETB_create-cname-image"
                                                                                            class="octicon octicon-question select-menu-item-icon ETB_create-cname-image">
                    <div class="select-menu-item-text"><span class="select-menu-item-heading">生成中文名图片和Emoji</span><span
                            class="description">生成中文名中的图片和绘文字，一般为名称前的小图标。</span></div>
                </label><label for="ETB_create-syringe" class="select-menu-item"><input type="checkbox"
                                                                                        id="ETB_create-syringe"
                                                                                        name="ETB_create-syringe"
                                                                                        class="octicon octicon-question select-menu-item-icon ETB_create-syringe">
                    <div class="select-menu-item-text"><span class="select-menu-item-heading">使用内置样式注入器</span><span
                            class="description">将自动写入汉化样式，无需第三方扩展。</span></div>
                </label>
                    <div class="select-menu-item"><img width="14" height="16"
                                                       class="octicon octicon-question select-menu-item-icon"
                                                       aria-hidden="true"
                                                       src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAIAAACp9tltAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAApZJREFUKJFNwX1MzHEcB/D35/v9/s7lXKqj0p0T1vXg2lIeh+thjZE/1Iw/8mwyjBn+sdmwGWZmy6LokllGm5mHYVYbmzIydTJlMtGTqJau7n6p3+/79a/XiywWEe2wEgAQEWcQRDwc1tnfyamcgTHFCMR+j4aEOzGm7N5GIjASds0pjPi+Tr36Rq3R9GlfkitxtpM7ZrKYGRuu1wjOeWx0PAgktUe1ra1vGzxJ3syFeWNJS662tOBd+/7l1oy4WYxIMGjTLE5j0rx07vHmokMnjuQxxgAAUEr19/efOXwwQwGAYCTsFnfNnSerc4vz8/ODwWBlZWVHR0dUVFRhYWFKSgrnHFAABJFms7hf1H28euUwgMbXDc/qb7oS4t/cbWt7/nTKfI9dH4OSgBLBkdHqaw96un6GQiEAuTl5PT2HAi3Nka6xNDLS+fhMp0OCQYFbBIuQoxzGUHA8JydX07SszKyCgvWbtu+c7s2oqns53251x8XdbmpG6jznt/rSz88upnvcfr/fMAz1n97e3i25q7rLLnjdLqakmgyFf/0cXOhxl5cd8fm8B/aXVFSUDwwMAEhISHAlp2qaRgSmlDRC+vHS+2Fr/Bw3bpd/Obq7+n3jsW1bt0opAfSOjO4or+obHhFKKjk+YUr4/f5AIFBadWt48OP4ROSekhIi0nW9a/BPVvHBD5fPCgBSmoAyTdPn82VnZ5umSUSMMV3XT5467Vm5ZlHe2vv+UgEo4nzv+qWF6/Izl61MW+CNjY2TUra1t79qal5StCsnPT1SSCgIEOM224rF3tbuITkR8CZPdnUFHz78GuSpRcfOR0RY7EJZmVJQFDFFm+uMBTAcDDGNHA4bQQ0OhSdMiy3KwUgxIgb143vnP5/yHx0OlzuwAAAAAElFTkSuQmCC">
                        <div class="select-menu-item-text"><span class="select-menu-item-heading">Tag通用样式</span><span
                                class="description"><div><div>Tag统一应用的样式，可修改为自己喜爱的样式。</div><label
                                for="ETB_global-style">表里共用样式</label><textarea id="ETB_global-style"
                                                                               name="ETB_global-style"
                                                                               class="txta ETB_global-style"
                                                                               wrap="off"></textarea><label
                                for="ETB_global-style-eh">表站样式</label><textarea id="ETB_global-style-eh"
                                                                                name="ETB_global-style-eh"
                                                                                class="txta ETB_global-style-eh"
                                                                                wrap="off"></textarea><label
                                for="ETB_global-style-ex">里站样式</label><textarea id="ETB_global-style-ex"
                                                                                name="ETB_global-style-ex"
                                                                                class="txta ETB_global-style-ex"
                                                                                wrap="off"></textarea></div></span>
                        </div>
                    </div>
                </div>
                <div class="select-menu-list js-navigation-container"><a target="_blank"
                                                                         href="https://github.com/Mapaler/EhTagTranslator/labels/%E6%A0%B7%E5%BC%8F%E5%88%86%E4%BA%AB"
                                                                         class="select-menu-item select-menu-action">
                    <svg width="14" viewBox="0 0 14 16" version="1.1" height="16"
                         class="octicon octicon-code select-menu-item-icon" aria-hidden="true">
                        <path d="M9.5 3l-1.5 1.5 3.5 3.5L8 11.5l1.5 1.5 4.5-5L9.5 3zM4.5 3L0 8l4.5 5 1.5-1.5L2.5 8l3.5-3.5L4.5 3z"></path>
                    </svg>
                    <div class="select-menu-item-text">其他用户分享的通用样式</div>
                </a>
                    <div class="select-menu-item select-menu-action">
                        <div class="select-menu-item-text">
                            <div>
                                <button id="ETB_reset-option" name="ETB_reset-option"
                                        class="btn btn-sm btn-danger ETB_reset-option">重置
                                </button>
                                <button id="ETB_save-option" name="ETB_save-option"
                                        class="btn btn-sm btn-primary ETB_save-option">保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div ng-if="nowPage == 'css'">
            <textarea ng-model="css"></textarea>
            </div>
            <div ng-if="nowPage == 'getData'">
                <div class="select-menu-header" ng-click="closeMenu()">
                    <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1"
                         viewBox="0 0 12 16" width="12">
                        <path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"/>
                    </svg>
                    <span class="select-menu-title">数据获取中。。</span>
                </div>

                <div class="select-menu-list js-navigation-container">
                    <div class="select-menu-item select-menu-action">
                        <svg ng-show="wikiVersion" aria-hidden="true" class="octicon select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"/></svg>
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">获取wiki版本信息</span>
                            <span class="description" ng-show="wikiVersion">{{wikiVersion.code}} {{timetime(wikiVersion.update_time)}}</span>
                        </div>
                    </div>
                    <div class="select-menu-item select-menu-action">
                        <svg ng-show="dataset" aria-hidden="true" class="octicon select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"/></svg>
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">获取列表页面</span>
                        </div>
                    </div>
                    <div ng-repeat="row in dataset" class="select-menu-item select-menu-action">
                        <svg ng-show="row.tags" aria-hidden="true" style="" class="octicon select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"/></svg>
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">获取{{row.cname}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;



(function() {
    'use strict';


    var wiki_URL="https://github.com/Mapaler/EhTagTranslator/wiki"; //GitHub wiki 的地址
    var wiki_raw_URL="https://raw.githubusercontent.com/wiki/Mapaler/EhTagTranslator"; //GitHub wiki 的地址
    var rows_title="rows"; //行名的地址
    var pluginVersion =  '2.7.1';
    var rootScope = null;

    function EhTagBuilder(){
        console.log('EhTagBuilder');
        var buttonInserPlace = document.querySelector(".pagehead-actions")||document.querySelector("#nb"); //按钮插入位置
        var li = document.createElement("li");
        li.id = 'etb';
        li.innerHTML = template;
        var app = angular.module("etb",[]);
        app.controller("etb",function($rootScope,$scope,$timeout){
            $scope.pluginVersion = pluginVersion;
            $scope.nowPage = "menu";
            $scope.menuShow = false;
            rootScope = $rootScope;
            $scope.dataset = false;
            $scope.wikiVersion = false;
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
                    c = Math.floor(t/k)
                    if (0 != c) {
                        return c+v+'前';
                    }
                }
            };

            $scope.openMenu = function () {
                $scope.nowPage = "menu";
                $scope.menuShow = true;
            };
            $scope.closeMenu = function () {
                $scope.menuShow = false;
            };
            $scope.startProgram = function () {
                $scope.nowPage = "getData";
                $timeout(async function () {
                    await startProgram($scope);
                    var css = buildCSS($scope.dataset);
                    $scope.css = css;
                    $scope.nowPage = 'css';
                    $scope.$apply();
                });
            };
            $scope.openOption = function () {
                $scope.nowPage = "option";
            };
            unsafeWindow.r = function () {
                $scope.$apply();
            };
        });
        angular.bootstrap(li,['etb']);
        unsafeWindow.etbApp = app;

        buttonInserPlace.insertBefore(li,buttonInserPlace.querySelector("li"));
    }

    async function startProgram($scope) {
        console.log('startProgram');


        //触发模板刷新
        function promiseScopeApply(p) {
            p.then(function () {setTimeout(function () {$scope.$apply();},0)},function () {setTimeout(function () {$scope.$apply();},0)});
        }

        var pp = {
            wikiVersion:getWikiVersion(),
            rows:getRows(),
            tags:[]
        };
        promiseScopeApply(pp.wikiVersion);
        promiseScopeApply(pp.rows);

        // if($scope){
        //     $scope.programPromise = pp;
        // }


        //获取 版本与row
        var [wikiVersion,rows] = await Promise.all([pp.wikiVersion,pp.rows]);

        $scope.dataset = rows;
        $scope.wikiVersion = wikiVersion;

        //构建获取tag任务 并执行
        rows.forEach(function (row) {
            var temp = getTags(row.name);
            promiseScopeApply(temp);
            temp.then(function (tag) {
                row.tags = tag;
            });
            pp.tags.push(temp);
        });

        //这里只是等待所有结束
        await Promise.all(pp.tags);
        return rows;
    }

    function buildCSS(dataset) {

        var css = "";
        dataset.forEach(function (row) {
            css+= `\n/* ${row.name} ${row.cname} */\n`;
            row.tags.forEach(function (tag) {

                if(tag.name){
                    var tagid = (row.name=="misc"?"":row.name + ":") + tag.name.replace(/\s/ig,"_");
                    var cname = mdImg2cssImg(specialCharToCss(tag.cname));
                    var content = mdImg2cssImg(htmlBr2cssBr(specialCharToCss(tag.cname)));
                    css+= `
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
                    css+= ``;
                }else{
                    css+= `\n/* ${row.cname} */\n`;
                }
            });
        });
        return css;

    }

    function specialCharToCss(str)
    {
        var strn = str;
        strn = strn.replace("\\","|");
        strn = strn.replace("\"","'");
        strn = strn.replace("\r","");
        strn = strn.replace("\n","\\A");
        return str;
    }


    function htmlBr2cssBr(mdText)
    {
        return mdText.replace(/<br[ \t]*(\/)?>/igm,"\\A ");
    }
    function mdImg2cssImg(mdText,max=Infinity)
    {
        var n = 0;
        return mdText.replace(/\!\[(.*?)\]\((.*?)\)/igm,function (text,alt,href,index) {
            n++;
            if( max >= n){
                var h = trim(href);
                if(h.slice(0,1) == "#"){
                    h = h.replace(/# +['"](.*?)['"]/igm,"$1")
                }else if(h.slice(h.length-1,h.length).toLowerCase() == 'h'){
                    h = h.slice(0,-1);
                }
                return `"url("${h}")"`;
            }
        });
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
        })
    }
    function trim(s){
        if(typeof s == 'string'){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }else{
            return s;
        }
    };
    function getRows() {
        return new Promise(async function (resolve, reject) {
            var url = `${wiki_raw_URL}/${rows_title}.md`;
            console.log(url);
            var data = await PromiseRequest.get(url);
            /*剔除表格以外的内容*/
            var re = (/^\|.*\|$/gm);
            var table = "";
            var temp = "";
            while( temp = re.exec(data))
            {
                if(table)table+="\n";
                table+=temp[0];
            }

            var tableArr = md_table.parse(table);
            var rows = [];
            tableArr.forEach(function (tr,index) {
                if(index>1){
                    rows.push({
                        name: trim(tr[0]),
                        cname:trim(tr[1]),
                        info:trim(tr[2]),
                    });
                };
            });
            resolve(rows);
        });
    }
    function getTags(row) {
        return new Promise(async function (resolve, reject) {
            var url = `${wiki_raw_URL}/tags/${row}.md`;
            console.log(url);
            var data = await PromiseRequest.get(url);
            console.log(row);

            /*剔除表格以外的内容*/
            var re = (/^\|.*\|$/gm);
            var table = "";
            var temp = "";
            while( temp = re.exec(data))
            {
                if(table)table+="\n";
                table+=temp[0];
            }
            try {
                var tableArr = md_table.parse(table);
            }catch(e){
                console.warn('表格存在格式问题');
            }
            var tags = [];
            tableArr.forEach(function (tr,index) {
                if(index>1){
                    tags.push({
                        name: trim(tr[0]),
                        cname:trim(tr[1]),
                        info: trim(tr[2]),
                    });
                };
            });
            resolve(tags);
        });
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
            if(rootScope && rootScope.$broadcast){

            }
            option.onprogress = function (response,response2) {
                var info = {
                    loaded:response.loaded,
                    position:response.position,
                    total:response.total,
                    totalSize:response.totalSize,
                };
                console.info('onprogress',info,response,response2);
            };
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
