// ==UserScript==
// @name        ETTWikiHelper-Thumbnail
// @name:zh-CN	E绅士标签翻译项目百科编辑辅助工具-缩略图
// @namespace   http://www.mapaler.com/
// @description Help to get thumbnail for write EhTagTranslator's wiki info.
// @description:zh-CN	自动将E绅士大缩略图域名改为手机站域名，并可以一键复制各站点格式的缩略图。
// @include     http://exhentai.org/g/*
// @include     http://g.e-hentai.org/g/*
// @version     1.0.0
// @grant       GM_setClipboard
// ==/UserScript==

//没有扩展时的debug
if(typeof(GM_setClipboard) == "undefined")
{
	var GM_setClipboard = function(str){
		alert(str);
		console.debug("使用GM_setClipboard，值为",str);
	}
}

var thumbnailPattern = "https?://(\\d+\\.\\d+\\.\\d+\\.\\d+|ul\\.ehgt\\.org|ehgt\\.org/t|exhentai\\.org/t)/(\\w+)/(\\w+)/(\\w+)\-(\\d+)\-(\\d+)\-(\\d+)\-(\\w+)_(l|250).jpg"; //缩略图地址正则匹配式
var gdtlObj = function(){
	var obj = {
		dom:"",
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
			var img = dom.getElementsByTagName("img")[0];
			var addsrc = this.addImgFromSrc(img.src);
			//img.src = img.src.replace(/http:\/\/\d+\.\d+\.\d+\.\d+\//ig,"http://ul.ehgt.org/");
			img.src = this.getSrc("手");
			
			function creat_li(text,href){
				var li = document.createElement("li");
				li.className = "EWHT-li";
				var btn = document.createElement("button");
				btn.className = "EWHT-btn";
				btn.innerHTML = text;
				li.appendChild(btn);
				return li
			}

			if (addsrc)
				return true;
			else
				return false;
		},
		addImgFromSrc: function(src)
		{
			if (src == undefined) return false;
			var regSrc = new RegExp(thumbnailPattern, "ig");
			var regResult = regSrc.exec(src);
			this.domain = regResult[1];
			this.path1 = regResult[2];
			this.path2 = regResult[3];
			this.hash1 = regResult[4];
			this.hash2 = regResult[5];
			this.width = regResult[6];
			this.height = regResult[7];
			this.extension = regResult[8];
			this.size = regResult[9];
			return true;
		},
		getSrc: function(type)
		{
			var srcA = [];
			srcA.push("http://");
			switch (type)
			{
				case 0:case "y":case "原":
					srcA.push(this.domain);
					break;
				case 1:case "s":case "手": 
					srcA.push("ul.ehgt.org");
					break;
				case 2:case "b":case "表": 
					srcA.push("ehgt.org/t");
					break;
				case 3:case "l":case "里":
				default:
					srcA.push("exhentai.org/t");
					break;
			}
			srcA.push("/",this.path1,"/",this.path2,"/",this.hash1,"-",this.hash2,"-",this.width,"-",this.height,"-",this.extension,"_",this.size,".jpg")
			return srcA.join("");
		},
		addBtnList: function(dom)
		{
			if (dom == undefined) dom = this.dom;
			function creat_li(text,href){
				var li = document.createElement("li");
				li.className = "EWHT-li";
				var btn = document.createElement("button");
				btn.className = "EWHT-btn";
				btn.innerHTML = text;
				btn.onclick = function(){GM_setClipboard(href)}
				li.appendChild(btn);
				return li
			}
			var ul = document.createElement("ul");
			ul.className = "EWHT-ul";
			ul.appendChild(creat_li("里",this.getSrc("里")));
			ul.appendChild(creat_li("表",this.getSrc("表")));
			ul.appendChild(creat_li("手",this.getSrc("手")));
			dom.appendChild(ul);

		},
	}
	return obj;
}

var gdt = document.getElementById("gdt");
var style = document.createElement("style");
style.type = "text/css";
var styleTxt = [
	[".gdtl","{"
	,[
		,"position:relative"
	].join(';\r\n '),"}"].join('\r\n'),
	[".EWHT-ul","{"
	,[
		,"position:absolute"
		,"top:0px"
		,"right:0px"
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

gdt.insertBefore(style,gdt.firstChild);

var gdtls = gdt.getElementsByClassName("gdtl");
if (gdtls.length>0)
{
	for (var gdi = 0; gdi < gdtls.length ; gdi++)
	{
		var gdtl_this = new gdtlObj;
		var addRes = gdtl_this.addImgFrom_gdtlDom(gdtls[gdi]);
		if (addRes) gdtl_this.addBtnList(gdtls[gdi]);
		else console.debug("没有添加按钮");
	}
}
else
{
	console.debug("小图模式，本脚本不起作用。");
}