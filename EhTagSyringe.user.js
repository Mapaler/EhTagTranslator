// ==UserScript==
// @name        EhTagSyringe
// @name:zh-CN	E绅士翻译注射器💉
// @namespace   http://www.mapaler.com/
// @description Build EhTagTranslater from Wiki.
// @description:zh-CN	从Wiki获取EhTagTranslater数据库，将E绅士TAG翻译为中文，并注射到E站
// @include     *://github.com/Mapaler/EhTagTranslator*
// @include     *://exhentai.org/*
// @include     *://e-hentai.org/*
// @connect     raw.githubusercontent.com
// @connect     github.com
// @icon        http://exhentai.org/favicon.ico
// @require     https://cdn.bootcss.com/angular.js/1.4.6/angular.min.js
// @resource    template         https://raw.githubusercontent.com/Mapaler/EhTagTranslator/master/template/ets-builder-menu.html?v=14
// @resource    ets-prompt       https://raw.githubusercontent.com/Mapaler/EhTagTranslator/master/template/ets-prompt.html?v=21
// @resource    ui-translate       https://raw.githubusercontent.com/Mapaler/EhTagTranslator/master/template/ui-translate.css?v=3
// @version     1.1.6
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
// @grant       GM_openInTab
// @copyright	2017+, Mapaler <mapaler@163.com> , xioxin <i@xioxin.com>
// ==/UserScript==



(function() {
    'use strict';

    window.requestAnimationFrame = unsafeWindow.requestAnimationFrame;
    unsafeWindow.wikiUpdate = autoUpdate;
    MutationObserver = window.MutationObserver;

    var wiki_URL="https://github.com/Mapaler/EhTagTranslator/wiki"; //GitHub wiki 的地址
    var wiki_raw_URL="https://raw.githubusercontent.com/wiki/Mapaler/EhTagTranslator/database"; //GitHub wiki 的原始文件地址
    var rows_filename="rows"; //行名的地址
    var pluginVersion = typeof(GM_info)!="undefined" ? GM_info.script.version.replace(/(^\s*)|(\s*$)/g, "") : "未获取到版本"; //本程序的版本
    var pluginName = typeof(GM_info)!="undefined" ? (GM_info.script.localizedName ? GM_info.script.localizedName : GM_info.script.name) : "EhTagSyringe"; //本程序的名称
    var rootScope = null;

    const headLoaded = new Promise(function (resolve, reject) {
        if(unsafeWindow.document.head && unsafeWindow.document.head.nodeName == "HEAD"){
            resolve(unsafeWindow.document.head);
        }else{
            //监听DOM变化
            MutationObserver = window.MutationObserver;
            var observer = new MutationObserver(function(mutations) {
                for(let i in mutations){
                    let mutation = mutations[i];
                    //监听到HEAD 结束
                    if(mutation.target.nodeName == "HEAD"){
                        observer.disconnect();
                        resolve(mutation.target);
                        break;
                    }
                }
            });
            observer.observe(document, {childList: true, subtree: true, attributes: true});
        }
    });

    function AddGlobalStyle(css) {
        //等待head加载完毕
        headLoaded.then(function (head) {
            GM_addStyle(css);
        })
    }

    AddGlobalStyle(`@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}`);

    var defaultConfig = {
        'showDescription':true,
        'imageLimit':3,
        'showIcon':true,
        'syringe':true,
        'searchHelper':true,
        'magnetHelper':true,
        'UITranslate':true,
        'download2miwifi':false,
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

    var etbConfig = GM_getValue('config');

    if(!etbConfig){
        /*默认配置 json转换是用来深拷贝 切断关联 */
        etbConfig = JSON.parse(JSON.stringify(defaultConfig));
        // 不用存储 反正是默认的
        // GM_setValue('config',etbConfig);
    }

    if ((/(exhentai\.org|e-hentai\.org)/).test(unsafeWindow.location.href)) {
        var tagsData = GM_getValue('tags');
    }else{
        var tagsData = [];
    }


    // 配置自动升级
    for(var i in defaultConfig){
        if(typeof etbConfig[i] === "undefined"){
            etbConfig[i] = JSON.parse(JSON.stringify(defaultConfig[i]));
        }
    }


    console.log('ets config:',etbConfig);

    function EhTagUITranslator(){

        //完整匹配才替换
        function routineReplace(query,dictionaries) {
            let elements = document.querySelectorAll(query);
            if(elements && elements.length){
                elements.forEach(function (element) {
                    if(element){
                        for(var i in element.childNodes){
                            let node = element.childNodes[i];
                            if(node.nodeName == '#text'){
                                let key = trim(node.textContent);
                                if(dictionaries[key]){
                                    node.textContent = node.textContent.replace(key,dictionaries[key]);
                                }
                            }
                        }
                    }
                })
            }
        }

        //不需要完整匹配直接替换
        function localRoutineReplace(query,dictionaries) {
            let elements = document.querySelectorAll(query);
            if(elements && elements.length){
                elements.forEach(function (element) {
                    if(element){
                        for(var key in dictionaries){
                            element.innerHTML = element.innerHTML.replace(key,dictionaries[key])
                        }
                    }
                })
            }
        }

        function inputReplace(query,text) {
            let input = document.querySelector(query);
            if(input)input.value = text;
        }
        function inputPlaceholder(query,text) {
            let input = document.querySelector(query);
            if(input)input.placeholder = text;
        }
        function titlesReplace(query,dictionaries) {
            let elements = document.querySelectorAll(query);
            if(elements && elements.length){
                elements.forEach(function (element) {
                    if(element){
                        if(element.title){
                            let key = trim(element.title);
                            if(key&&dictionaries[key]){
                                element.title = element.title.replace(key,dictionaries[key]);
                            }
                        }
                    }
                })
            }
        }


        var className = {
            "artistcg" :"画师集",
            "cosplay"  :"COSPLAY",
            "doujinshi":"同人本",
            "gamecg"   :"游戏CG",
            "imageset" :"图集",
            "manga"    :"漫画",
            "misc"     :"杂项",
            "non-h"    :"非H",
            "western"  :"西方",
            "asianporn":"亚洲"
        };


        var translator = {};

        /*公共*/
        translator.public = function () {
            routineReplace('#nb a,.ip a,#frontpage a',{
                "Front Page":"首页",
                "Torrents":"种子",
                "Favorites":"收藏",
                "Settings":"设置",
                "My Galleries":"我的画廊",
                "My Home":"我的首页",
                "Toplists":"排行榜",
                "Bounties":"悬赏",
                "News":"新闻",
                "Forums":"论坛",
                "Wiki":"维基",
                "HentaiVerse":"HV游戏",
            });
            titlesReplace(".ygm",{
                "Contact Poster":"联系发帖人",
                "Contact Uploader":"联系上传者",
            });

            //classIconReplace(".ic");



        };

        /*画廊页*/
        translator.gallery = function () {
            routineReplace('.gdt1',{
                "Posted:":"添加时间：",
                "Parent:":"父级：",
                "Visible:":"可见：",
                "Language:":"语言：",
                "File Size:":"体积：",
                "Length:":"页数：",
                "Favorited:":"收藏：",
            });
            routineReplace('.gdt2',{
                "Yes":"是",
                "No":"否",
                "None":"无",
            });
            localRoutineReplace('.gdt2',{
                "times":"次",
                "pages":"页",
                "Japanese":"日文",
                "English":"英文",
                "Chinese":"中文",
                "Dutch":"荷兰语",
                "French":"法语",
                "German":"德语",
                "Hungarian":"匈牙利",
                "Italian":"意呆利",
                "Korean":"韩语",
                "Polish":"波兰语",
                "Portuguese":"葡萄牙语",
                "Russian":"俄语",
                "Spanish":"西班牙语",
                "Thai":"泰语",
                "Vietnamese":"越南语",
            });
            routineReplace('#grt1',{
                "Rating:":"评分：",
            });
            routineReplace('#favoritelink',{
                "Add to Favorites":"添加收藏",
            });
            AddGlobalStyle(`.tc{ white-space:nowrap; }`);
            routineReplace('.tc',{
                "artist:":"艺术家：",
                "character:":"角色：",
                "female:":"女性：",
                "group:":"团队：",
                "language:":"语言：",
                "male:":"男性：",
                "misc:":"杂项：",
                "parody:":"原作：",
                "reclass:":"重新分类："
            });
            localRoutineReplace('#gd5 p',{
                "Report Gallery":"举报画廊",
                "Archive Download":"打包下载",
                "Petition to Expunge":"请求删除",
                "Petition to Rename":"请求重命名",
                "Torrent Download":"种子下载",
                "Show Gallery Stats":"画廊状态",
            });
            routineReplace('#gdo4 div',{
                "Normal":"小图",
                "Large":"大图",
            });
            localRoutineReplace('#gdo2 div',{
                "rows":"行"
            });
            routineReplace('#cdiv .c4',{
                "Uploader Comment":"上传者评论",
            });
            routineReplace('#cdiv .c4 a',{
                "Vote+":"支持",
                "Vote-":"反对"
            });

            localRoutineReplace('.gpc',{
                "Showing":"当前页面显示图片为",
                "of":"共",
                "images":"张"
            });

            localRoutineReplace('#eventpane p',{
                "It is the dawn of a new day!":"新的一天开始啦",
                "Reflecting on your journey so far, you find that you are a little wiser."
                    :"到目前为止，你的旅程展示出了你的聪慧",
                "You gain":"你获得了",
                "EXP":"经验",
                "Credits":"积分(C)",
            });

            localRoutineReplace('#rating_label',{
                "Average:":"平均:"
            });
            routineReplace('#tagmenu_act',{
                "Vote Up":"支持",
                "Vote Down":"反对",
                "Show Tagged Galleries":"搜索标签",
                "Show Tag Definition":"标签简介",
                "Add New Tag":"添加新标签",
            });
            routineReplace('#postnewcomment a',{
                "Post New Comment":"发表评论",
            });


            inputPlaceholder("#newtagfield","新增标签: 输入新的标签，用逗号分隔");

            titlesReplace(".gdt2 .halp",{
                "This gallery has been translated from the original language text.":"这个画廊已从原文翻译过来了。"
            });

            let rating_label = document.querySelector('#rating_label');
            if(rating_label){
                //监听评分显示DOM变化 触发替换内容
                let observer = new MutationObserver(function(mutations) {
                    for(let i in mutations){
                        for(let n in mutations[i].addedNodes){
                            let node = mutations[i].addedNodes[n];
                            if(node.nodeName == "#text"){
                                node.textContent = node.textContent.replace("Average:","平均:");
                                node.textContent = node.textContent.replace("Rate as","打分");
                                node.textContent = node.textContent.replace("stars","星");
                            }
                        }
                    }
                });
                observer.observe(rating_label, {childList:true});
            }

        };
        /*种子下载页面*/
        translator.torrent = function () {
            routineReplace('#torrentinfo td span', {
                "Posted:"   : "上传时间：",
                "Size:"     : "体积：",
                "Seeds:"    : "种源数：",
                "Peers:"    : "下载中：",
                "Downloads:": "下载次数：",
                "Uploader:" : "上传者：",
            });
        };

        /*用户设置页面*/
        translator.settings = function () {
            routineReplace('#outer h1',{
                "Settings":"设置"
            });
            routineReplace('#outer h2',{
                "Image Load Settings":"图像加载设置",
                "Image Size Settings":"图像大小的设置",
                "Gallery Name Display":"画廊的名字显示",
                "Archiver Settings":"归档设置",
                "Front Page Settings":"首页设置",
                "Favorites":"收藏",
                "Ratings":"评分",
                "Tag Namespaces":"标签组",
                "Excluded Languages":"排除语言",
                "Search Result Count":"搜索结果数",
                "Thumbnail Settings":"缩略图设置",
                "Gallery Comments":"画廊评论",
                "Gallery Tags":"画廊标签",
                "Gallery Page Numbering":"画廊页面页码",
                "Hentai@Home Local Network Host":"Hentai@Home本地网络服务器"
            });
            routineReplace('.optmain p',{
                "Do you wish to load images through the Hentai@Home Network, if available?"
                    :"是否希望通过 Hentai@Home 网路加载资源, 如果可以?",
                "Normally, images are resampled to 1280 pixels of horizontal resolution for online viewing. You can alternatively select one of the following resample resolutions."
                    :"通常情况，图像将重采样到1280像素宽度以用于在线浏览，您也可以选择以下重新采样分辨率。",
                "To avoid murdering the staging servers, resolutions above 1280x are temporarily restricted to donators, people with any hath perk, and people with a UID below 3,000,000."
                    :"但是为了避免负载过高，高于1280像素将只供给于赞助者、特殊贡献者，以及UID小于3,000,000的用户",
                "While the site will automatically scale down images to fit your screen width, you can also manually restrict the maximum display size of an image. Like the automatic scaling, this does not resample the image, as the resizing is done browser-side. (0 = no limit)"
                    :"虽然图片会自动根据窗口缩小，你也可以手动设置最大大小，图片并没有重新采样（0为不限制）",
                "Many galleries have both an English/Romanized title and a title in Japanese script. Which gallery name would you like to see as default?"
                    :"很多画廊都同时拥有英文或者日文标题，你想默认显示哪一个？",
                "The default behavior for the Archiver is to confirm the cost and selection for original or resampled archive, then present a link that can be clicked or copied elsewhere. You can change this behavior here."
                    :"默认归档下载方式为手动选择(原画质或压缩画质),然后手动改复制或点击下载链接,你可以修改归档下载方式",
                "Which display mode would you like to use on the front and search pages?"
                    :"你想在搜索页面显示哪种样式?",
                "What categories would you like to view as default on the front page?"
                    :"你希望在首页上看到哪些类别?",
                "Here you can choose and rename your favorite categories."
                    :"在这里你可以重命名你得收藏夹",
                "You can also select your default sort order for galleries on your favorites page. Note that favorites added prior to the March 2016 revamp did not store a timestamp, and will use the gallery posted time regardless of this setting."
                    :"你也可以选择收藏夹中默认排序.请注意，2016年3月改版之前加入收藏夹的画册并未保存收藏时间，会以画册发布时间代替.",
                "By default, galleries that you have rated will appear with red stars for ratings of 2 stars and below, green for ratings between 2.5 and 4 stars, and blue for ratings of 4.5 or 5 stars. You can customize this by entering your desired color combination below."
                    :"默认情况，被你评分的画册，2星以下显示红色，2.5星到4星显示绿色，4.5到5星显示蓝色. 你可以在下面输入自己所需的颜色组合.",
                "If you want to exclude certain namespaces from a default tag search, you can check those below. Note that this does not prevent galleries with tags in these namespaces from appearing, it just makes it so that when searching tags, it will forego those namespaces."
                    :"如果要从默认标签搜索中排除某些标签组，可以检查以下内容。 请注意，这不会阻止在这些标签组中的标签的展示区出现，它只是在搜索标签时排除这些标签组。",
                "If you wish to hide galleries in certain languages from the gallery list and searches, select them from the list below."
                    :"如果您希望以图库列表中的某些语言隐藏画廊并进行搜索，请从下面的列表中选择它们。",
                "Note that matching galleries will never appear regardless of your search query."
                    :"请注意，无论搜索查询如何，匹配的图库都不会出现。",
                "How many results would you like per page for the index/search page and torrent search pages? (Hath Perk: Paging Enlargement Required)"
                    :"搜索页面每页显示多少条数据？ （Hath Perk：付费扩展）",
                "How would you like the mouse-over thumbnails on the front page to load when using List Mode?"
                    :"你希望鼠标悬停缩略图何时加载?",
                "You can set a default thumbnail configuration for all galleries you visit."
                    :"画廊页面缩略图设置",
                "Sort order for gallery comments:"
                    :"评论排序方式:",
                "Show gallery comment votes:"
                    :"显示评论投票数:",
                "Sort order for gallery tags:"
                    :"图库标签排序方式:",
                "Show gallery page numbers:"
                    :"显示画廊页码:",
                "This setting can be used if you have a H@H client running on your local network with the same public IP you browse the site with. Some routers are buggy and cannot route requests back to its own IP; this allows you to work around this problem."
                    :"如果你本地安装了H@H客户端,本地ip与浏览网站的公共ip相同,一些路由器不支持回流导致无法访问到自己,你可以设置这里来解决",
                "If you are running the client on the same PC you browse from, use the loopback address (127.0.0.1:port). If the client is running on another computer on your network, use its local network IP. Some browser configurations prevent external web sites from accessing URLs with local network IPs, the site must then be whitelisted for this to work."
                    :"如果在同一台电脑上访问网站和运行客户端，请使用本地回环地址(127.0.0.1:端口号). 如果客户端在网络上的其他计算机运行,请使用那台机器的内网ip. 某些浏览器的配置可能阻止外部网站访问本地网络,你必须将网站列入白名单才能工作."
            });
            routineReplace('.optmain label',{
                "Yes (Recommended)"
                    : "是 (推荐)",
                "No (You will not be able to browse as many pages. Enable only if having problems.)"
                    : "不 (你将无法一次浏览多页，请只有在出问题的时候启动此功能.)",
                "Auto": "自动",
                "Default Title": "默认标题",
                "Japanese Title (if available)": "日文标题 (如果可用)",
                "Manual Select, Manual Start (Default)": "手动选择,手动下载 (默认)",
                "Manual Select, Auto Start": "手动选择,自动下载",
                "Auto Select Original, Manual Start": "自动选择原始画质,手动下载",
                "Auto Select Original, Auto Start": "自动选择原始画质,自动下载",
                "Auto Select Resample, Manual Start": "自动选择压缩画质,手动下载",
                "Auto Select Resample, Auto Start": "自动选择压缩画质,自动下载",
                "List View": "列表视图",
                "Thumbnail View": "缩略图视图",
                "By last gallery update time": "以最新的画册更新时间排序",
                "By favorited time": "以收藏时间排序",
                "artist":"艺术家",
                "character":"角色",
                "female":"女性",
                "group":"团队",
                "language":"语言",
                "male":"男性",
                "misc":"杂项",
                "parody":"原作",
                "reclass":"重新分类",
                "25 results": "25个",
                "50 results": "50个",
                "100 results": "100个",
                "200 results": "200个",
                "On mouse-over (pages load faster, but there may be a slight delay before a thumb appears)"
                    : "鼠标悬停时 (页面加载快,缩略图加载有延迟)",
                "On page load (pages take longer to load, but there is no delay for loading a thumb after the page has loaded)"
                    : "页面加载时 (页面加载时间更长,但是显示的时候无需等待)",
                "Normal": "小图",
                "Large": "大图",
                "Oldest comments first": "最早的评论",
                "Recent comments first": "最新的评论",
                "By highest score": "分数最高",
                "On score hover or click": "悬停或点击时",
                "Always": "总是",
                "Alphabetical": "按字母排序",
                "By tag power": "按标签权重",
                "No": "否",
                "Yes": "是"
            });

            routineReplace('.optmain #ru2',{
                "Each letter represents one star. The default RRGGB means R(ed) for the first and second star, G(reen) for the third and fourth, and B(lue) for the fifth. You can also use (Y)ellow for the normal stars. Any five-letter combination of R, G, B and Y will work."
                    :"每个字母代表一个星,默认是 RRGGB ,第1和2是红色,第3和4是绿色,第5个为蓝色, \n你可以使用 R:红色 G:绿色 B:蓝色 Y:黄色 任何5位组合都是有效的.",
            });

            routineReplace('.optmain .optsub td,.optmain .optsub th',{
                "Size:":"大小:",
                "Rows:":"行数:",
                "Horizontal:":"宽:",
                "Vertical:":"高:",
                "pixels":"像素",
                "Original":"原始语言",
                "Translated":"翻译版",
                "Rewrite":"改编版",
                "All":"所有",
                "Japanese":"日文",
                "English":"英文",
                "Chinese":"中文",
                "Dutch":"荷兰语",
                "French":"法语",
                "German":"德语",
                "Hungarian":"匈牙利",
                "Italian":"意呆利",
                "Korean":"韩语",
                "Polish":"波兰语",
                "Portuguese":"葡萄牙语",
                "Russian":"俄语",
                "Spanish":"西班牙语",
                "Thai":"泰语",
                "Vietnamese":"越南语",
                "N/A":"无效",
                "Other":"其他",
            });

            inputReplace('#apply input[type=submit]','应用');
            routineReplace('#msg',{
                "Settings were updated":"设置已更新",
            });




        };

        translator.home = function () {
            routineReplace('#toppane h1.ih',{
                "E-Hentai Galleries: The Free Hentai Doujinshi, Manga and Image Gallery System":"E-Hentai E绅士画廊:一个免费的绅士漫画、同人志和图片系统",
                "ExHentai.org - The X Makes It Sound Cool":"ExHentai.org - X使它听起来很酷 ",
            });
            inputPlaceholder("#searchbox input[name=f_search]","搜索关键词");
            inputReplace("#searchbox input[name=f_apply]","搜索");
            inputReplace("#searchbox input[name=f_clear]","清空");

            routineReplace('#searchbox .nopm a',{
                "Show Advanced Options":"显示高级选项",
                "Show File Search":"显示文件搜索",
            });
            localRoutineReplace('#dmo',{
                "Display:":"视图:",
                "Show ":"显示",
                "List":"列表",
                "Thumbnails":"缩略图"
            })
            routineReplace('.itg th',{
                "Published":"发布时间",
                "Name":"名称",
                "Uploader":"上传者"
            });

            routineReplace("#pt",{"Popular Right Now":"当下流行"});

            localRoutineReplace('.id42',{
                "files":"张"
            });



            let itc = document.querySelector('#searchbox .itc');
            if(itc){
                //监听评分显示DOM变化 触发替换内容
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function (mutation) {
                        if(mutation.type == "attributes" && mutation.attributeName == "value"){
                            let input = mutation.target;
                            input.parentNode.className = input.value*1?"":"icon_disable";
                        }
                    });
                });
                observer.observe(itc, {childList: true, subtree: true, attributes: true});
            }

            let itc_inputs = document.querySelectorAll('#searchbox .itc td input');
            if(itc_inputs)itc_inputs.forEach(function (input) {
                input.parentNode.className = input.value*1?"":"icon_disable";
            });


        };


        /*ui翻译路由*/
        translator.public();
        translator.home();
        if(hrefTest(/exhentai\.org\/g\/|e-hentai\.org\/g\//))translator.gallery();
        if(hrefTest(/gallerytorrents\.php/))translator.torrent();
        if(hrefTest(/uconfig\.php/))translator.settings();

    }

    //UI控制方法等等
    function EhTagBuilder(){
        console.log('EhTagBuilder');

        var buttonInserPlace = document.querySelector(".pagehead-actions");//按钮插入位置
        var li = document.createElement("li");
        li.id = 'etb';
        li.setAttribute('ng-csp','ng-csp');
        li.innerHTML = GM_getResourceText('template');
        var app = angular.module("etb",[]);
        app.controller("etb",function($rootScope,$scope,$location,$anchorScroll){
            // console.log();
            $scope.pluginVersion = pluginVersion;
            $scope.pluginName = pluginName;

            $scope.config = etbConfig;

            $scope.nowPage = "menu";
            $scope.menuShow = false;
            rootScope = $rootScope;
            $scope.dataset = false;
            $scope.wikiVersion = false;

            var backdrop = document.querySelector(".modal-backdrop");
            if(backdrop)backdrop.addEventListener('click',function(){
                $scope.closeMenu();
                $scope.$apply();
            });


            //xx时间前转换方法
            $scope.timetime = timeInterval;
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
                GM_setValue('tags',{
                    css:$scope.css,
                    data:$scope.dataset,
                    map:tagsIndexes($scope.dataset),
                    version:$scope.wikiVersion,
                    update_time:new Date().getTime()
                });
                myNotification('保存完毕');
            };

            $scope.copyStylishCss = function () {
                GM_setClipboard($scope.cssStylish)
                myNotification('复制完毕');
            };
            $scope.copyCss = function () {
                GM_setClipboard($scope.css)
                myNotification('复制完毕');
            };

            //打开设置界面
            $scope.openOption = function () {
                $scope.nowPage = "option";
            };
            //保存设置
            $scope.optionSave = function () {
                GM_setValue('config',etbConfig);
                myNotification('保存成功');

            };
            //重置设置
            $scope.optionReset = function () {
                if(confirm('确定要重置配置吗？')){
                    $scope.config = etbConfig = JSON.parse(JSON.stringify(defaultConfig));
                    GM_setValue('config',etbConfig);
                    myNotification('已重置');
                }
            };

            $rootScope.$on('$locationChangeSuccess', function(event){
                if( $location.path() == "/ets-open-option" ){
                    $scope.openMenu();
                    $scope.openOption();
                    $anchorScroll('etb')
                    $location.path("/");
                }
                if( $location.path() == "/ets-open-menu" ){
                    $scope.openMenu();
                    $anchorScroll('etb')
                    $location.path("/");
                }
                if( $location.path() == "/ets-auto-update" ){
                    $scope.openMenu();
                    $scope.startProgram().then(function () {
                        $scope.saveCss();
                    })
                    $anchorScroll('etb');
                    $location.path("/");
                }
                if( $location.path() == "/ets-set-config" ){
                    let s = $location.search();
                    for(var i in s){
                        var v = s[i];
                        if(v === 'true'){
                            v = true;
                        }
                        if(v === 'false'){
                            v = false;
                        }
                        etbConfig[i] = v;
                    }
                    GM_setValue('config',etbConfig);
                    myNotification('配置已修改',{body:JSON.stringify(s)});
                    $location.path("/").search({});
                }

                if( $location.path() == "/ets-reset-config" ){
                    $scope.optionReset();
                    $location.path("/");
                }
            });

        });
        angular.bootstrap(li,['etb']);
        // unsafeWindow.etbApp = app;
        buttonInserPlace.insertBefore(li,buttonInserPlace.querySelector("li"));
        console.log('EhTagBuilder loaded')
    }

    //样式写入方法 enema syringe
    function EhTagSyringe(){
        console.time('EhTagSyringe Load Enema');
        let tags = tagsData;
        console.timeEnd('EhTagSyringe Load Enema');
        if(!tags)return;

        console.time('EhTagSyringe Infusion');
        unsafeWindow.tags = tags;
        AddGlobalStyle(tags.css);
        AddGlobalStyle(etbConfig.style.public);

        if((/(exhentai\.org)/).test(unsafeWindow.location.href)){
            AddGlobalStyle(etbConfig.style.ex);
        }
        if((/(e-hentai\.org)/).test(unsafeWindow.location.href)){
            AddGlobalStyle(etbConfig.style.eh);
        }

        //临时隐藏翻译用的样式
        AddGlobalStyle(`
        .hideTranslate #taglist a{font-size:12px !important;}
        .hideTranslate #taglist a::before{display:none !important;}
        .hideTranslate #taglist a::after{display:none !important;}
        `);
        console.timeEnd('EhTagSyringe Infusion');
    }

    function EhTagSyringeLink() {
        let taglist = document.querySelector("#taglist");
        var linkBoxPlace = document.querySelector("#tagmenu_act");
        var linkBox = document.createElement("div");
        linkBox.id = "TES-link-box";
        linkBox.style.marginBottom='5px';
        console.log(tagsData);
        let tags = tagsData.data;
        let map = tagsData.map||{};
        console.log('map',map);
        // document.body.appendChild(linkBox);
        AddGlobalStyle(`div#tagmenu_act{height:auto}`);

        linkBoxPlace.insertBefore(linkBox,linkBoxPlace.childNodes[0]);
        function getTag(r, i) {
            r = r.replace(/_/igm," ");
            i = i.replace(/_/igm," ");
            let mr = map[r];
            return tags[mr.index].tags[mr.tags[i]];
        }

        if(taglist&&linkBoxPlace){
            let linkBoxPlaceObserver = new MutationObserver(function(mutations) {
                console.log('linkBoxPlaceObserver',mutations);
                for(var i in mutations){
                    let mutation = mutations[i];
                    if(mutation.type == "childList" && mutation.addedNodes.length>=21){
                        linkBoxPlace.insertBefore(linkBox,linkBoxPlace.childNodes[0]);
                    }
                }
            });
            linkBoxPlaceObserver.observe(linkBoxPlace, {childList: true});

            let observer = new MutationObserver(function(mutations) {
                console.log('taglist_a',mutations);
                linkBox.innerHTML="";
                for(let i in mutations){
                    let mutation = mutations[i];
                    if(mutation.type == 'attributes' && mutation.attributeName == 'style'){
                        let a = mutation.target;
                        if(a.style.color == 'blue'){
                            let keys = a.id.replace('ta_','').split(':');
                            if(keys.length == 2){
                                let tag = getTag(keys[0],keys[1]);
                                if(tag&&tag.links){
                                    tag.links.forEach(function (a) {
                                        linkBox.innerHTML +=`<img src="https://ehgt.org/g/mr.gif" class="mr" alt=">"> <a target="_blank" href="${a.href}">${a.title}</a>`
                                    })
                                }
                            }
                        }
                    }
                }
            });
            observer.observe(taglist, {childList: true, subtree: true, attributes: true});


        }
    }

    //EH站更新提示
    function EhTagVersion(){
        console.log('EhTagVersion');
        var buttonInserPlace = document.querySelector("#nb"); //按钮插入位置
        if(!buttonInserPlace)return;

        var span = document.createElement("span");
        var iconImg  = "https://exhentai.org/img/mr.gif";


        if((/(exhentai\.org)/).test(unsafeWindow.location.href)){
            iconImg="https://ehgt.org/g/mr.gif";
            span.className=span.className+" isEX";
        }
        var etsPrompt = GM_getResourceText('ets-prompt');
        // etsPrompt = ``;

        span.innerHTML = `${etsPrompt}`;

        var app = angular.module("etb",[]);
        app.controller("etb",function($rootScope,$scope){
            $scope.pluginVersion = pluginVersion;
            $scope.pluginName = pluginName;
            $scope.iconImg = iconImg;
            $scope.config = etbConfig;
            $scope.noData = false;
            let tags = tagsData;
            if(!tags){
                $scope.noData =true;
            }
            $scope.nowPage = "";
            $scope.menuShow = false;
            rootScope = $rootScope;
            $scope.dataset = false;
            $scope.wikiVersion = {};
            if(tags){
                $scope.wikiVersion = tags.version;
                $scope.update_time = tags.update_time;
            }
            $scope.hide = false;
            //xx时间前转换方法
            $scope.timetime = timeInterval;
            //打开菜单按钮
            $scope.openMenu = function () {
                console.log('openMenu');
                $scope.nowPage = "menu";
                $scope.menuShow = !$scope.menuShow;
            };
            $scope.showRow = {};
            $scope.showRow.value = false;
            $scope.showRow.change = function(value){
                if(value){
                    document.body.className = "hideTranslate"
                }else{
                    document.body.className = "";
                }
            };

            $scope.VersionCheck = function () {
                getWikiVersion().then(function (Version) {
                    $scope.lastVersionCheck = {
                        time:new Date().getTime(),
                        version:Version,
                    };
                    GM_setValue('lastVersionCheck',$scope.lastVersionCheck);
                    $scope.newVersion = Version;
                    $scope.$apply();

                    //这是个秘密
                    if(etbConfig.autoUpdate){
                        if($scope.newVersion.code != $scope.wikiVersion.code){
                            autoUpdate().then(function () {
                                myNotification('更新完毕，刷新页面生效');
                            });
                        }
                    }
                    console.log(Version);
                });
            };

            let lastVersionCheck = GM_getValue('lastVersionCheck');
            $scope.lastVersionCheck = lastVersionCheck;
            if(!lastVersionCheck){
                console.log('auto VersionCheck1');
                $scope.VersionCheck();
            }else{
                $scope.newVersion = lastVersionCheck.version;
                //限制20分钟检查一次版本
                if(new Date().getTime() - lastVersionCheck.time > 20*60*1000 ){
                    console.log('auto VersionCheck');
                    $scope.VersionCheck();
                }
            }
            unsafeWindow.r = function () {
                $scope.$apply();
            };
        });
        angular.bootstrap(span,['etb']);
        unsafeWindow.etsApp = app;

        buttonInserPlace.appendChild(span);
    }

    //搜索输入框助手
    function EhTagInputHelper(){
        if(!etbConfig.searchHelper){
            return;
        }
        let tags = tagsData;
        // console.log(tags);
        if(!tags)return;

        console.time('add datalist');
        let stdinput = document.querySelector('#searchbox input[name=f_search]');
        if(!stdinput){return}
        stdinput.setAttribute("list", "tbs-tags");

        var datalist = document.createElement("datalist");
        datalist.setAttribute("id", "tbs-tags");
        stdinput.parentNode.insertBefore(datalist,stdinput.nextSibling);


        //调整加载顺序 作家在前面影响搜索
        let loadOrder = [
            'female',
            'male',
            'language',
            'character',
            'reclass',
            'misc',
            'parody',
            'artist'
        ];
        var tagsk = {};
        tags.data.forEach(function (row) {
            tagsk[row.name] = row;
        });
        loadOrder.forEach(function (key) {
            let row = tagsk[key];
            let type = row.name;
            let typeName = row.cname;
            row.tags.forEach(function (tag) {
                if(tag.name){
                    let z = document.createElement("OPTION");
                    z.setAttribute("value", `${type}:"${tag.name}$"`);
                    z.setAttribute("label", `${typeName}:${mdImg2cssImg(tag.cname,0)}`);
                    datalist.appendChild(z);
                }
            });
        })


        console.timeEnd('add datalist');


    }

    //磁力链复制助手
    function EhTagMagnetHelper(){
        if(!(/gallerytorrents\.php/).test(unsafeWindow.location.href)){
            return;
        }
        console.log('EhTagMagnetHelper');

        let tableList = document.querySelectorAll("#torrentinfo form table");

        if(tableList&&tableList.length)tableList.forEach(function (table) {
            console.log(table);

            let href = '';
            let a = table.querySelector('a');
            if(a)href = a.href;
            if(!href)return;

            let magnet = href.replace(/.*?([0-9a-f]{40}).*$/i,"magnet:?xt=urn:btih:$1") ;
            if(magnet.length != 60)return;

            let insertionPoint = table.querySelector('input');
            if(!insertionPoint)return;

            var button = document.createElement("input");
            button.type = "button";
            button.value = "复制磁力链";
            button.className = 'stdbtn';
            button.onclick = function () {
                GM_setClipboard(magnet);
                myNotification('复制成功',{
                    body:magnet
                });
            };
            console.log(magnet);


            // let parent = ;
            insertionPoint.parentNode.insertBefore( button, insertionPoint );
        })






    }

    //小米路由下载助手
    function EhTagMiWifi(){
        if(!(/gallerytorrents\.php/).test(unsafeWindow.location.href)){
            return;
        }
        console.log('EhTagMiWifi');
        let tableList = document.querySelectorAll("#torrentinfo form table");
        if(tableList&&tableList.length)tableList.forEach(function (table) {
            let href = '';
            let a = table.querySelector('a');
            if(a)href = a.href;
            if(!href)return;

            let magnet = href.replace(/.*?([0-9a-f]{40}).*$/i,"magnet:?xt=urn:btih:$1") ;
            if(magnet.length != 60)return;

            let insertionPoint = table.querySelector('input');
            if(!insertionPoint)return;

            var button = document.createElement("input");
            button.type = "button";
            button.value = "下载到小米路由器";
            button.className = 'stdbtn';
            button.onclick = function () {
                unsafeWindow.resizeTo(1000, 600);
                unsafeWindow.location.href =`https://d.miwifi.com/d2r/?url=${btoa(magnet)}`;
            };
            insertionPoint.parentNode.insertBefore( button, insertionPoint );
        })






    }

    //获取数据
    async function startProgram($scope){
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
                row.tags = parseTable(mdText,row.name);
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
    function buildCSS(dataset,wikiVersion){
        console.time('生成css样式');
        var css = "";

        css+=`
/* update_time:${wikiVersion.update_time} */
/* hash:${wikiVersion.code} */
        `;

        dataset.forEach(function (row) {
            css+= `\n/* ${row.name} ${row.cname} */\n`;
            // console.log(row.tags);
            row.tags.forEach(function (tag) {
                if(tag.name){
                    var tagid = (row.name=="misc"?"":row.name + ":") + tag.name.replace(/\s/ig,"_");
                    var cname = mdImg2cssImg(specialCharToCss(tag.cname),etbConfig.imageLimit<0?Infinity:etbConfig.imageLimit);
                    if(!tag.info)tag.info="";
                    var content = mdImg2cssImg(htmlBr2cssBr(specialCharToCss(tag.info)),etbConfig.imageLimit<0?Infinity:etbConfig.imageLimit);
                    css += `
a[id="ta_${tagid}"]{
font-size:0px;
}
a[id="ta_${tagid}"]::before{
content:"${cname}";
}
`;
                    if(content)css+=`a[id="ta_${tagid}"]::after{
content:"${content}";
}`;

                }else{
                    css += `\n/* ${row.cname} */\n`;
                }
            });
        });
        console.timeEnd('生成css样式');
        return css;

    }

    //Stylish css
    function buildStylishCSS(css,config){
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
            }else{
                return "";
            }
        });
    }

    function specialCharToCss(str){
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

            PromiseRequest.get(wiki_URL+'/_history?t='+new Date().getTime()).then(function (response) {
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

    function timeInterval (time){
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
    }

    //获取行 并解析
    function getRows(){
        return new Promise(async function (resolve, reject) {
            var url = `${wiki_raw_URL}/${rows_filename}.md`+"?t="+new Date().getTime();
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

            var url = `${wiki_raw_URL}/${row}.md`+"?t="+new Date().getTime();
            console.log(url);
            console.time(`加载 ${row}`);
            var data = await PromiseRequest.get(url);
            console.timeEnd(`加载 ${row}`);
            resolve(data);
        });
    }

    function parseTable(data,name){
        /*剔除表格以外的内容*/
        var re = (/^\s*(\|.*\|)\s*$/gm);
        var table = "";
        var temp = "";
        while( temp = re.exec(data) ){
            if(table)table+="\n";
            table+=temp[1];
        }
        table = table.replace(/\\\|/igm,"{~Line~}");
        let tableArr = table.split("\n").map(
            (row)=>row.split("|").map(
                (t)=>t.replace("{~Line~}","|")
            )
        );
        let tags = [];
        var count = [];
        tableArr.forEach(function (tr,index) {
            if(index>1){
                let t = {};
                tr[1] = trim(tr[1]||"");
                tr[2] = trim(tr[2]||"");
                tr[3] = trim(tr[3]||"");
                tr[4] = trim(tr[4]||"");
                if(tr[1])t.name  = tr[1];
                if(tr[2])t.cname = tr[2];
                if(tr[3])t.info  = tr[3];
                if(tr[4])t.links = mdLinks(tr[4]);
                tags.push(t);
                if(t.name){count++};
            }
        });
        console.log(name,count);
        return tags;
    }
    function mdLinks(mdText) {
        var links = [];
        mdText.replace(/\[(.*?)\]\((.*?)\)/igm,function (text,alt,href,index) {
            links.push({
                title:alt,
                href:href,
            });
            return text;
        });
        return links
    }

    function hrefTest(re){
        return re.test(unsafeWindow.location.href);
    }


    function tagsIndexes(tags) {
        let map = {};
        console.time('构建索引');
        tags.forEach(function (v,row) {
            map[v.name] = {
                index:row,
                tags:{}
            };
            v.tags.forEach(function (tag,index) {
                map[v.name].tags[tag.name] = index;
            })
        });
        console.timeEnd('构建索引');
        return map;
    }

    async function autoUpdate() {
        var $scope = {};
        $scope.$apply = function(){};
        await startProgram($scope);
        var css = buildCSS($scope.dataset,$scope.wikiVersion);
        GM_setValue('tags',{
            css:css,
            data:$scope.dataset,
            map:tagsIndexes($scope.dataset),
            version:$scope.wikiVersion,
            update_time:new Date().getTime()
        });
        return true;
    }

    async function myNotification(title,options)
    {
        let permission = await Notification.requestPermission();
        if(permission == 'granted'){
            return new Notification(title, options);
        }else{
            return false;
        }
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

    var bootstrapInited = false;
    var bootstrap = function(){
        if(bootstrapInited)return;
        bootstrapInited = true;
        //在github页面下添加生成工具
        if((/github\.com/).test(unsafeWindow.location.href)){
            EhTagBuilder();
        }

        //在EH站点下添加版本提示功能
        if ((/(exhentai\.org|e-hentai\.org)/).test(unsafeWindow.location.href)) {
            if(etbConfig.syringe)EhTagVersion();
            if(etbConfig.syringe)EhTagSyringeLink();
            if(etbConfig.searchHelper)EhTagInputHelper();
            if(etbConfig.download2miwifi)EhTagMiWifi();
            // EhTagMiWifi();
            if(etbConfig.magnetHelper)EhTagMagnetHelper();
            if(etbConfig.UITranslate)EhTagUITranslator();
        }
    };

    if (/loaded|complete/.test(document.readyState)){
        bootstrap();
    }else{
        document.addEventListener('DOMContentLoaded',bootstrap,false);
    }
    // domLoaded.then(function () {
    //     bootstrap();
    // });

    //注射器总开关
    if(etbConfig.syringe){
        //注入css 不需要等待页面
        if((/(exhentai\.org\/g\/|e-hentai\.org\/g\/)/).test(unsafeWindow.location.href)){
            EhTagSyringe();
        }
    }

    //UI翻译用的样式
    if(etbConfig.UITranslate){
        if(hrefTest(/(exhentai\.org|e-hentai\.org)/)){
            AddGlobalStyle(GM_getResourceText('ui-translate'))
        }
    }


})();

