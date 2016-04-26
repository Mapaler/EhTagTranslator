// ==UserScript==
// @name        EhTagTranslator-CSS
// @namespace   http://www.mapaler.com/
// @description Translate E-Hentai tags to Chinese.
// @include     *://github.com/Mapaler/EhTagTranslator*
// @version     1.0.0
// @grant       none
// @copyright	2016+, Mapaler <mapaler@163.com>
// ==/UserScript==

var GithubWiki = "https://github.com/Mapaler/EhTagTranslator/wiki";
var dataset = [];
var row = function ()
{
	var obj =
	{
		name:"",
		translation:"",
		tags:[],
	}
	return obj;
}
var tag = function ()
{
	var obj =
	{
		name:"",
		translation:"",
		summary:"",
	}
	return obj;
}
//最初的按钮加载地
var btnInsertPlace = document.getElementsByClassName("pagehead-actions")[0];

//生成设置窗口DOM
var crtInsertPlace = document.getElementsByClassName("container")[0] || document.body;
var crtWindow = buildCreatCSS();
crtInsertPlace.appendChild(crtWindow);

//生成生成CSS窗口
function buildCreatCSS()
{
	var set = document.createElement("div");
	set.id = "EhTagTranslator-CSS";
	set.className = "select-menu-modal";
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

