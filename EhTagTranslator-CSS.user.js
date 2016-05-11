// ==UserScript==
// @name        EhTagTranslator-CSS
// @namespace   http://www.mapaler.com/
// @description Translate E-Hentai tags to Chinese.
// @include     *://github.com/Mapaler/EhTagTranslator*
// @version     1.0.0
// @grant       none
// @copyright	2016+, Mapaler <mapaler@163.com>
// ==/UserScript==

var wiki_URL="https://github.com/Mapaler/EhTagTranslator/wiki"; //GitHub wiki 的地址
var rows_title="rows"; //行名的地址
var downOver; //检测下载是否完成的循环函数
var rowsCount = 0; //行名总数
var rowsCurrent = 0; //当前下载行名
var ds = [];
var rowObj = function(){
	var obj = {
		name:"",
		cname:"",
		info:{},
		tags:[],
		addTagFromName: function(rowObj)
		{
			if (rowObj == undefined)
				rowObj = this;
			GM_xmlhttpRequest({
				method: "GET",
				url: wiki_URL + (this.name.length?"/"+this.name:""),
				onload: function(response) {
					dealTags(response.responseText,rowObj.tags);
				}
			});
		},
	}
	return obj;
}
var tagObj = function(){
	var obj = {
		name:"",
		cname:"",
		info:{},
	}
	return obj;
}
//访GM_xmlhttpRequest函数v1.0
if(typeof(GM_xmlhttpRequest) == "undefined")
{
	var GM_xmlhttpRequest = function(GM_param){
		var xhr = new XMLHttpRequest();	//创建XMLHttpRequest对象
		if(GM_param.responseType) xhr.responseType = GM_param.responseType;
		xhr.onreadystatechange = function()  //设置回调函数
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			GM_param.onload(xhr);
		}
		for (var header in GM_param.headers){
			xhr.setRequestHeader(header, GM_param.headers[header]);
		}
		xhr.open(GM_param.method, GM_param.url, true);
		xhr.send(GM_param.data ? GM_param.data : null);
	}
}

GM_xmlhttpRequest({
	method: "GET",
	url: wiki_URL + (rows_title.length?"/"+rows_title:""),
	onload: function(response) {
		dealRows(response.responseText,ds);
	}
});

//处理行的页面
function dealRows(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");

	var wiki_body = PageDOM.getElementById("wiki-body");
	var table = wiki_body.getElementsByTagName("table")[0].tBodies[0];
	rowsCount = table.rows.length;
	for(var ri=0;ri<table.rows.length;ri++)
	{
		var trow = table.rows[ri];
		var row = new rowObj;
		row.name = trow.cells[0].textContent;
		row.cname = trow.cells[1].textContent;
		row.info = getTrueImgUrlInfo(trow.cells[2]);
		row.addTagFromName();
		dataset.push(row);
	}
	
	clearInterval(downOver);
	if (!startProgramCheck(dataset))
	{
		downOver = setInterval(function () { startProgramCheck(dataset) }, 500);
	}
}

//获取介绍是图片还是文字
function getTrueImgUrlInfo(dom)
{
	var info = {
		type:0,
		content:"",
	};
	if (dom.getElementsByTagName("img").length>0)
	{
		var img = dom.getElementsByTagName("img")[0];
		info.type = 1;
		info.content = img.getAttribute("data-canonical-src");
	}
	else
	{
		info.type = 0;
		info.content = dom.textContent;
	}
	return info;
}


//处理Tag页面
function dealTags(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");

	var wiki_body = PageDOM.getElementById("wiki-body");
	var table = wiki_body.getElementsByTagName("table")[0].tBodies[0];
	
	for(var ri=0;ri<table.rows.length;ri++)
	{
		var trow = table.rows[ri];
		var tag = new tagObj;
		tag.name = trow.cells[0].textContent;
		tag.cname = trow.cells[1].textContent;
		tag.info = getTrueImgUrlInfo(trow.cells[2]);
		dataset.push(tag);
	}
	rowsCurrent++;
}

//检测下载完成情况
function startProgramCheck(dataset)
{
	if (rowsCount > 0 && rowsCurrent >= rowsCount)
	{
		console.debug("获取完成");
		clearInterval(downOver);
		var css = startCSSBuild(dataset);
		var downBlob = new Blob([css], {'type': 'text\/css'});
		var downurl = window.URL.createObjectURL(downBlob);
		console.log(downurl);
		return true;
	}
	else
	{
		console.debug("获取%d/%d",rowsCurrent, rowsCount);
		return false;
	}
}

//开始构建CSS
function startCSSBuild(dataset)
{
	var cssAry = [];
	cssAry.push(""
//▼CSS内容部分
,"@namespace url(http://www.w3.org/1999/xhtml);"
,""
,"@-moz-document"
,"    url-prefix('http://exhentai.org/g/'), "
,"    url-prefix('http://g.e-hentai.org/g/')"
,"{"
,"  #taglist a:before{"
,"    font-size:12px;"
,"  }"
,"  #taglist a:hover:after,#taglist a:focus:after{"
,"    color:#fff;"
,"    font-size:15px;"
,"    background: #666;"
,"    border: 1px solid #fff;"
,"    border-radius:5px;"
,"    float:left;"
,"    position:fixed;"
,"    top:25px;"
,"    z-index:999;"
,"    padding:2px;"
,"    box-shadow: 0px 0px 5px #888888;"
,"    min-width:150px;"
,"    max-width:260px;"
,"    white-space:pre-wrap;"
,"    font-size:12px;"
,"    transition: opacity 1s;"
,"    opacity: 1;"
,"  }"
//▲CSS内容部分
	)
	
	for (var ri = 0; ri < dataset.length; ri++)
	{
		var row = dataset[ri];
		for (var ti = 0; ti < row.tags.length; ti++)
		{
			var tag = row.tags[ti];
			cssAry.push(""
//▼CSS内容部分
,"  a[id|=\"ta_" + row.name + ":" + tag.name.replace(" ","_") + "\"]{"
,"    font-size:0px;"
,"  }"
,"  a[id|=\"ta_" + row.name + ":" + tag.name.replace(" ","_") + "\"]:before{"
,"    content:\"" + tag.cname + "\";"
,"  }"
,"  a[id|=\"ta_" + row.name + ":" + tag.name.replace(" ","_") + "\"]:hover:after,a[id|=\"ta_" + row.name + ":" + tag.name.replace(" ","_") + "\"]:focus:after{"
,"    content:" + (tag.info.type?"url(" + tag.info.content + ")":"\"" + tag.info.content +　"\"") + ";"
,"  }"
//▲CSS内容部分
			)
		}
	}
	
	cssAry.push(""
//▼CSS内容部分
,"}"
//▲CSS内容部分
	)
	
	var css = cssAry.join("\r\n");
	return css;
}


//生成直接下载链接窗口
function buildWindow()
{
	var set = document.createElement("div");
	set.id = "PixivUserBatchDownloadDirectLink";
	set.className = "notification-popup";
	set.style.display = "block";
	//自定义CSS
	var style = document.createElement("style");
	set.appendChild(style);
	style.type = "text/css";
	style.innerHTML +=
		[
			".PUBD_dLink" + "{\r\n" + [
				'width:100%',
				'height:300px',
				'overflow:scroll',
				'border:1px solid #becad8',
			].join(';\r\n') + "\r\n}",
			"#PixivUserBatchDownloadDirectLink a" + "{\r\n" + [
				'display:inline',
				'padding:0',
				'background:none',
				'color:	#258fb8',
				'white-space:nowrap',
			].join(';\r\n') + "\r\n}",
		].join('\r\n');

	//标题行
	var h2 = document.createElement("h2");
	h2.innerHTML = "直接下载链接";

	//设置内容
	var ul = document.createElement("ul");
	ul.className = "notification-list message-thread-list";

	//导出-Batch
	var li = document.createElement("li");
	//li.className = "thread";
	//var divTime = document.createElement("div");
	//divTime.className = "time date";
	var divName = document.createElement("div");
	divName.className = "name";
	var divText = document.createElement("div");
	divText.className = "text";
	//li.appendChild(divTime);
	li.appendChild(divName);
	li.appendChild(divText);
	ul.appendChild(li);

	divName.innerHTML = "用<a href=\"https://addons.mozilla.org/firefox/addon/downthemall/\" target=\"_blank\">DownThemAll!</a>的批量下载，重命名掩码设置为“*title*”<br />" +
		"如果发生403错误，使用<a href=\"https://addons.mozilla.org/firefox/addon/referrer-control/\" target=\"_blank\">RefControl</a>添加站点“pixiv.net”，设置“伪装-发送站点根目录”";
	//divTime.innerHTML = "保存为bat文件运行"
	var ipt = document.createElement("div");
	ipt.className = "PUBD_dLink";
	divText.appendChild(ipt);

	//确定按钮行
	var confirmbar = document.createElement("div");
	confirmbar.className = "_notification-request-permission";
	confirmbar.style.display = "block";
	var btnClose = document.createElement("button");
	btnClose.className = "_button";
	btnClose.innerHTML = "关闭";
	btnClose.onclick = function () { set.parentNode.removeChild(set); }

	confirmbar.appendChild(btnClose);

	set.appendChild(h2);
	set.appendChild(ul);
	set.appendChild(confirmbar);
	return set;
}

var inserPlace = document.getElementsByClassName("pagehead-actions")[0];
inserPlace.insertBefore(buildButton(),inserPlace.getElementsByTagName("li")[0]);
//生成按钮
function buildButton()
{
	var li = document.createElement("li");
	var select_menu = document.createElement("div");
	select_menu.className = "select-menu js-menu-container js-select-menu";
	li.appendChild(select_menu);
	var button = document.createElement("button");
	button.className = "btn btn-sm select-menu-button js-menu-target css-truncate";
	select_menu.appendChild(button);
	var span = document.createElement("span");
	span.innerHTML = " EhTagTranslator ";
	button.appendChild(span);
	select_menu.appendChild(buildMenuModal("menu"));
	return li;
}

//生成菜单窗口
function buildMenuModal(mode)
{
	var modal_holder = document.createElement("div");
	modal_holder.className = "select-menu-modal-holder js-menu-content js-navigation-container js-active-navigation-container";
	var modal = document.createElement("div");
	modal.className = "select-menu-modal subscription-menu-modal js-menu-content";
	modal_holder.appendChild(modal);
	var header = document.createElement("div");
	header .className = "select-menu-header js-navigation-enable";
	modal.appendChild(header);

	var CloseSvg = buildSVG("Close");
	header.appendChild(CloseSvg);
	var title = document.createElement("span");
	title.className = "select-menu-title";
	title.innerHTML = "请选择任务";
	header.appendChild(title);
	/*
	var filters  = document.createElement("div");
	filters .className = "select-menu-filters";
	modal.appendChild(filters);
	*/
	var list1  = document.createElement("div");
	list1.className = "select-menu-list js-navigation-container js-active-navigation-container";
	modal.appendChild(list1);
	
	var item1  = document.createElement("div");
	item1.className = "select-menu-item js-navigation-item";
	list1.appendChild(item1);
	item1.appendChild(buildSVG("true"));
	
	var list2  = document.createElement("div");
	list2.className = "select-menu-list";
	modal.appendChild(list2);
	
	return modal_holder;
}

//生成svg
function buildSVG(mode)
{
	var CloseSvgDiv = document.createElement("div");
	switch (mode) {
		case "Close":
			CloseSvgDiv.innerHTML = '<svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z"/></svg>';
			break;

		case "Settings":
			CloseSvgDiv.innerHTML = '<svg width="14" viewBox="0 0 14 16" version="1.1" height="16" class="octicon octicon-gear" aria-hidden="true"><path d="M14 8.77V7.17l-1.94-0.64-0.45-1.09 0.88-1.84-1.13-1.13-1.81 0.91-1.09-0.45-0.69-1.92H6.17l-0.63 1.94-1.11 0.45-1.84-0.88-1.13 1.13 0.91 1.81-0.45 1.09L0 7.23v1.59l1.94 0.64 0.45 1.09-0.88 1.84 1.13 1.13 1.81-0.91 1.09 0.45 0.69 1.92h1.59l0.63-1.94 1.11-0.45 1.84 0.88 1.13-1.13-0.92-1.81 0.47-1.09 1.92-0.69zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';
			break;
	
		case "true":
		default:
			CloseSvgDiv.innerHTML = '<svg width="12" viewBox="0 0 12 16" version="1.1" height="16" class="octicon octicon-check select-menu-item-icon" aria-hidden="true"><path d="M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z"/></svg>';
			break;
	}
	var CloseSvg = CloseSvgDiv.getElementsByTagName("svg")[0];
	return CloseSvg;
}