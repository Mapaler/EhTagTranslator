// ==UserScript==
// @name        ETTWikiHelper-Thumbnail
// @name:zh-CN	E绅士标签翻译项目百科编辑辅助工具-缩略图
// @namespace   http://www.mapaler.com/
// @description Help to get thumbnail for write EhTagTranslator's wiki info.
// @description:zh-CN	自动将E绅士大缩略图域名改为手机站域名，并可以一键复制各站点格式的缩略图。
// @include     /^https?://(exhentai\.org|e-hentai\.org)/$/
// @include     /^https?://(exhentai\.org|e-hentai\.org)/g/\d+/\w+/.*$/
// @include     /^https?://(exhentai\.org|e-hentai\.org)/(index\.php)?\?.*$/
// @include     /^https?://(exhentai\.org|e-hentai\.org)/(tag|uploader)/.*$/
// @include     /^https?://(exhentai\.org|e-hentai\.org)/(doujinshi|manga|artistcg|gamecg|western|non-h|imageset|cosplay|asianporn|misc).*$/
// @include     /^https?://(exhentai\.org|e-hentai\.org)/s/\w+/\d+-\d+.*$/
// @version     1.9.3
// @grant       GM_setClipboard
// @author      Mapaler <mapaler@163.com>
// @copyright	2017+, Mapaler <mapaler@163.com>
// ==/UserScript==
				
//没有扩展时的debug
if(typeof(GM_setClipboard) == "undefined")
{
	var GM_setClipboard = function(str){
		prompt(str,str);
		console.debug("使用GM_setClipboard，值为",str);
	}
}

//发送网页通知
function spawnNotification(theBody, theIcon, theTitle)
{
	var options = {
		body: theBody,
		icon: theIcon
	}
	if (!("Notification" in window))
	{
		alert(theBody);
	}
	else if (Notification.permission === "granted") {
		Notification.requestPermission(function (permission) {
		// If the user is okay, let's create a notification
		var n = new Notification(theTitle, options);
		});
	}
	// Otherwise, we need to ask the user for permission
	else if (Notification.permission !== 'denied') {
		Notification.requestPermission(function (permission) {
		// If the user is okay, let's create a notification
		if (permission === "granted") {
			var n = new Notification(theTitle, options);
		}
		});
	}
}

var thumbnailPattern = "https?://(\\d+\\.\\d+\\.\\d+\\.\\d+|ul\\.ehgt\\.org|ehgt\\.org|exhentai\\.org)(?:/t)?/(\\w+)/(\\w+)/(\\w+)\-(\\d+)\-(\\d+)\-(\\d+)\-(\\w+)_(l|250).jpg"; //缩略图地址正则匹配式
var gdtlObj = function(){
	var obj = {
		dom:"",
		fullsrc:"",
		domain:"",
		path1:"",
		path2:"",
		hash1:"",
		hash2:"",
		width:"",
		height:"",
		extension:"",
		size:"",
		addImgFrom_gdtlDom: function(dom)
		{
			if (dom == undefined) dom = this.dom;
			else this.dom = dom;
			var img = dom.querySelector("img");
			if (img == null) console.log(dom)
			var addsrc = this.addImgFromSrc(img.src);

			if (addsrc)
				return true;
			else
				return false;
		},
		addImgFromSrc: function(src)
		{
			if (src == undefined) return false;
			this.fullsrc = src;
			var regSrc = new RegExp(thumbnailPattern, "ig");
			var regResult = regSrc.exec(src);
			if (regResult)
			{
				this.domain = regResult[1];
				this.path1 = regResult[2];
				this.path2 = regResult[3];
				this.hash1 = regResult[4];
				this.hash2 = regResult[5];
				this.width = regResult[6];
				this.height = regResult[7];
				this.extension = regResult[8];
				this.size = regResult[9];
			}
			return true;
		},
		replaceImgSrcFrom_gdtlDom: function(dom,type)
		{
			if (dom == undefined) dom = this.dom;
			else this.dom = dom;
			var img = dom.getElementsByTagName("img")[0];
			img.src = this.getSrc(type);
		},
		getSrc: function(type)
		{
			var resrc = "";
			if (type == 0 || type == "y" || type == "原")
			{
				resrc = this.fullsrc;
			}else
			{
				var srcA = [];
				srcA.push(location.protocol,"//"); //添加https: 和 //
				switch (type)
				{
					case 1:case "s":case "手": 
						srcA.push("ul.ehgt.org");
						break;
					case 2:case "b":case "表": 
						srcA.push("ehgt.org");
						break;
					case 3:case "l":case "里":
					default:
						srcA.push("exhentai.org/t");
						break;
				}
				srcA.push("/",this.path1,"/",this.path2,"/",this.hash1,"-",this.hash2,"-",this.width,"-",this.height,"-",this.extension,"_",this.size,".jpg");
				resrc = srcA.join("");
			}
			return resrc;
		},
		addBtnList: function(dom,type)
		{
			if (dom == undefined) dom = this.dom;
			if (type == undefined) type = 0;
			function creat_li(text,href){
				var li = document.createElement("li");
				li.className = "EWHT-li";
				var btn = document.createElement("button");
				btn.className = "EWHT-btn";
				btn.innerHTML = text;
				btn.onclick = function(event){
					var pressCtrl = false;
					var pressAlt = false;
					var pressShift = false;
					var e = event || window.event || arguments.callee.caller.arguments[0];
					//ctrlKey
					if(e && e.ctrlKey){ // 有按下 Ctrl 
						pressCtrl = true;
					}
					//shiftKey
					if(e && e.shiftKey){ // 有按下 Shift
						pressShift = true;
					}
					//altKey
					if(e && e.altKey){ // 有按下 Alt
						pressAlt = true;
					}
					
					var str = href;
					if (pressCtrl && !pressShift && !pressAlt) //只按Ctrl
					{
						str = "![图](" + href + ")";
					}else if (!pressCtrl && !pressShift && pressAlt) //只按Alt
					{
						str = "![图](# \"" + href + "\")";
					}
					GM_setClipboard(str);
					spawnNotification(str,href,"已复制到剪贴板 - " +　text);
				}
				
				li.appendChild(btn);
				return li
			}
			if (type == 0)
			{
				var ul = document.createElement("ul");
				ul.className = "EWHT-ul";
				ul.appendChild(creat_li("里",this.getSrc("里")));
				ul.appendChild(creat_li("表",this.getSrc("表")));
				ul.appendChild(creat_li("手",this.getSrc("手")));
				dom.appendChild(ul);
			}else if (type == 1)
			{
				var ul = document.createElement("ul");
				ul.className = "EWHT-ul";
				ul.appendChild(creat_li("原",this.getSrc("原")));
				dom.appendChild(ul);
			}
		},
	}
	return obj;
}

var style = document.createElement("style");
style.type = "text/css";
var styleTxt = [
	//画廊缩略图
	["#gdt .gdtl","{"
	,[
		,"position:relative"
	].join(';\r\n '),"}"].join('\r\n'),
	["#gdt .EWHT-ul","{"
	,[
		,"top:0px"
		,"right:0px"
	].join(';\r\n '),"}"].join('\r\n'),
	//画廊封面
	["#gleft .EWHT-ul","{"
	,[
		,"top:15px"
		,"left:-5px"
	].join(';\r\n '),"}"].join('\r\n'),
	//搜索列表
	[".itg .id1","{"
	,[
		,"position:relative"
	].join(';\r\n '),"}"].join('\r\n'),
	[".itg .EWHT-ul","{"
	,[
		,"top:33px"
		,"right:-5px"
	].join(';\r\n '),"}"].join('\r\n'),
	//图片浏览页
	["#i3","{"
	,[
		,"position:relative"
	].join(';\r\n '),"}"].join('\r\n'),
	["#i3 .EWHT-ul","{"
	,[
		,"top:-30px"
		,"right:0px"
	].join(';\r\n '),"}"].join('\r\n'),
	//通用
	[".EWHT-ul","{"
	,[
		,"position:absolute"
		,"list-style:none"
		,"padding:0px"
		,"margin:0px"
	].join(';\r\n '),"}"].join('\r\n'),
	[".EWHT-ul .EWHT-btn","{"
	,[
		,"padding:0px"
		,"font-size:12px"
		,"width:18px"
	].join(';\r\n '),"}"].join('\r\n'),
].join('\r\n');
style.innerHTML = styleTxt;
var head = document.head || document.querySelector('head');
head.appendChild(style);

var gdt = document.querySelector("#gdt");
var itg = document.querySelector(".itg");
var i3 = document.querySelector("#i3");
if (gdt) //画廊
{
	var gdtls = gdt.getElementsByClassName("gdtl");
	if (gdtls.length>0)
	{
		for (var gdi = 0,len= gdtls.length ; gdi <len; gdi++)
		{
			var gdtl_this = new gdtlObj;
			var addRes = gdtl_this.addImgFrom_gdtlDom(gdtls[gdi]);
			if (addRes) {
				gdtl_this.addBtnList(gdtls[gdi],0);
				//gdtl_this.replaceImgSrcFrom_gdtlDom(gdtls[gdi],"里"); //替换默认的缩略图
			}
			else console.debug("缩略图添加网址失败");
		}
	}
	else
	{
		console.debug("小图模式，本脚本不起作用。");
	}

}
else if (itg) //搜索列表
{
	var id1s = itg.getElementsByClassName("id1");
	if (id1s.length>0)
	{
		for (var id1i = 0,len= id1s.length ; id1i <len; id1i++)
		{
			var id3s = id1s[id1i].querySelector(".id3");
			var id3_this = new gdtlObj;
			var addRes = id3_this.addImgFrom_gdtlDom(id3s);
			if (addRes) id3_this.addBtnList(id1s[id1i],0);
			else console.debug("添加网址失败");
		}
	}
	else
	{
		console.debug("找不到图象列表。");
	}
}
else if (i3) //图片浏览页
{
	var i3_this = new gdtlObj;
	var addRes = i3_this.addImgFrom_gdtlDom(i3);
	if (addRes) i3_this.addBtnList(i3,1);
	else console.debug("添加网址失败");
}
else //都不是
{
	console.debug("本脚本在该页面上不运行");
}