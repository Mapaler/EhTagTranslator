// ==UserScript==
// @name        EhTagBuilder
// @name:zh-CN	E绅士标签构建者
// @name:zh-TW	E紳士標籤構建者
// @name:zh-HK	E紳士標籤構建者
// @namespace   http://www.mapaler.com/
// @homepage	https://github.com/Mapaler/EhTagTranslator
// @supportURL  https://github.com/Mapaler/EhTagTranslator/issues
// @description Build EhTagTranslater from Wiki.
// @description:zh-CN	从Wiki获取EhTagTranslater数据库，将E绅士TAG翻译为中文
// @description:zh-TW	從Wiki獲取EhTagTranslater資料庫，將E紳士TAG翻譯為中文
// @description:zh-HK	從Wiki獲取EhTagTranslater資料庫，將E紳士TAG翻譯為中文
// @include     *://github.com/Mapaler/EhTagTranslator*
// @include     *://github.com/EhTagTranslation/Database*
// @icon        http://exhentai.org/favicon.ico
// @version     2.9.2
// @grant       none
// @author      Mapaler <mapaler@163.com>
// @copyright	2017+, Mapaler <mapaler@163.com>
//-@grant       GM_xmlhttpRequest
//-@grant       GM_getValue
//-@grant       GM_setValue
//-@grant       GM_deleteValue
//-@grant       GM_listValues
// ==/UserScript==

(function() {
var newRe = location.pathname.indexOf("EhTagTranslation/Database")>=0; //是否已经迁移
var wiki_URL= newRe ? //GitHub wiki 的地址
			  "https://github.com/EhTagTranslation/Database/tree/master/" : //新的组织项目地址
			  "https://github.com/Mapaler/EhTagTranslator/wiki"; //传统Wiki地址
var wiki_version_filename = "version"; //版本的地址
var rows_filename = newRe?"database/rows.md":"rows"; //行名的地址
var buttonInserPlace = document.querySelector(".pagehead-actions"); //按钮插入位置
var windowInserPlace = document.querySelector(".UnderlineNav"); //窗口插入位置
var scriptVersion = "unknown"; //本程序的版本
var scriptName = "EhTagBuilder"; //本程序的名称
if (typeof(GM_info)!="undefined")
{
	scriptVersion = GM_info.script.version.replace(/(^\s*)|(\s*$)/g, "");
	if (GM_info.script.name_i18n)
	{
		var i18n = (navigator.language||navigator.userLanguage).replace("-","_"); //获取浏览器语言
		scriptName = GM_info.script.name_i18n[i18n]; //支持Tampermonkey
	}
	else
	{
		scriptName = GM_info.script.localizedName || //支持Greasemonkey 油猴子 3.x
					 GM_info.script.name; //支持Violentmonkey 暴力猴
	}
}
var optionVersion = 1; //当前设置版本，用于提醒是否需要重置设置
var database_structure_version = newRe?6:4; //当前数据库结构版本，用于提醒是否需要更新脚本
var downOverCheckHook; //检测下载是否完成的循环函数
var rowsCount = 0; //行名总数
var rowsCurrent = 0; //当前下载行名
//匹配Emoji正则表达式，Made by @xioxin
var emojireg = /\u{2139}|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|\u{2328}|\u{23CF}|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|\u{24C2}|[\u{25AA}-\u{25AB}]|\u{25B6}|\u{25C0}|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|\u{260E}|\u{2611}|[\u{2614}-\u{2615}]|\u{2618}|\u{261D}|\u{2620}|[\u{2622}-\u{2623}]|\u{2626}|\u{262A}|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2648}-\u{2653}]|\u{2660}|\u{2663}|\u{2666}|\u{2668}|\u{267B}|\u{267F}|[\u{2692}-\u{2697}]|\u{2699}|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|\u{26C8}|\u{26CE}|\u{26CF}|\u{26D1}|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|\u{26FD}|\u{2702}|\u{2705}|[\u{2708}-\u{2709}]|[\u{270A}-\u{270B}]|[\u{270C}-\u{270D}]|\u{270F}|\u{2712}|\u{2714}|\u{2716}|\u{271D}|\u{2721}|\u{2728}|[\u{2733}-\u{2734}]|\u{2744}|\u{2747}|\u{274C}|\u{274E}|[\u{2753}-\u{2755}]|\u{2757}|\u{2763}|[\u{2795}-\u{2797}]|\u{27A1}|\u{27B0}|\u{27BF}|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|\u{2B50}|\u{2B55}|\u{3030}|\u{303D}|\u{3297}|\u{3299}|\u{1F004}|\u{1F0CF}|[\u{1F170}-\u{1F171}]|\u{1F17E}|\u{1F17F}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F201}-\u{1F202}]|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F23A}]|[\u{1F250}-\u{1F251}]|[\u{1F300}-\u{1F320}]|\u{1F321}|[\u{1F324}-\u{1F32C}]|[\u{1F32D}-\u{1F32F}]|[\u{1F330}-\u{1F335}]|\u{1F336}|[\u{1F337}-\u{1F37C}]|\u{1F37D}|[\u{1F37E}-\u{1F37F}]|[\u{1F380}-\u{1F393}]|[\u{1F396}-\u{1F397}]|[\u{1F399}-\u{1F39B}]|[\u{1F39E}-\u{1F39F}]|[\u{1F3A0}-\u{1F3C4}]|\u{1F3C5}|[\u{1F3C6}-\u{1F3CA}]|[\u{1F3CB}-\u{1F3CE}]|[\u{1F3CF}-\u{1F3D3}]|[\u{1F3D4}-\u{1F3DF}]|[\u{1F3E0}-\u{1F3F0}]|[\u{1F3F3}-\u{1F3F5}]|\u{1F3F7}|[\u{1F3F8}-\u{1F3FF}]|[\u{1F400}-\u{1F43E}]|\u{1F43F}|\u{1F440}|\u{1F441}|[\u{1F442}-\u{1F4F7}]|\u{1F4F8}|[\u{1F4F9}-\u{1F4FC}]|\u{1F4FD}|\u{1F4FF}|[\u{1F500}-\u{1F53D}]|[\u{1F549}-\u{1F54A}]|[\u{1F54B}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|[\u{1F56F}-\u{1F570}]|[\u{1F573}-\u{1F579}]|\u{1F57A}|\u{1F587}|[\u{1F58A}-\u{1F58D}]|\u{1F590}|[\u{1F595}-\u{1F596}]|\u{1F5A4}|\u{1F5A5}|\u{1F5A8}|[\u{1F5B1}-\u{1F5B2}]|\u{1F5BC}|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5DC}-\u{1F5DE}]|\u{1F5E1}|\u{1F5E3}|\u{1F5E8}|\u{1F5EF}|\u{1F5F3}|\u{1F5FA}|[\u{1F5FB}-\u{1F5FF}]|\u{1F600}|[\u{1F601}-\u{1F610}]|\u{1F611}|[\u{1F612}-\u{1F614}]|\u{1F615}|\u{1F616}|\u{1F617}|\u{1F618}|\u{1F619}|\u{1F61A}|\u{1F61B}|[\u{1F61C}-\u{1F61E}]|\u{1F61F}|[\u{1F620}-\u{1F625}]|[\u{1F626}-\u{1F627}]|[\u{1F628}-\u{1F62B}]|\u{1F62C}|\u{1F62D}|[\u{1F62E}-\u{1F62F}]|[\u{1F630}-\u{1F633}]|\u{1F634}|[\u{1F635}-\u{1F640}]|[\u{1F641}-\u{1F642}]|[\u{1F643}-\u{1F644}]|[\u{1F645}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6CB}-\u{1F6CF}]|\u{1F6D0}|[\u{1F6D1}-\u{1F6D2}]|[\u{1F6E0}-\u{1F6E5}]|\u{1F6E9}|[\u{1F6EB}-\u{1F6EC}]|\u{1F6F0}|\u{1F6F3}|[\u{1F6F4}-\u{1F6F6}]|[\u{1F6F7}-\u{1F6F8}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|[\u{1F931}-\u{1F932}]|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|\u{1F9C0}|[\u{1F9D0}-\u{1F9E6}]/gu;

//仿GM_xmlhttpRequest函数v1.3
if (typeof(GM_xmlhttpRequest) == "undefined") {
    var GM_xmlhttpRequest = function(GM_param) {

        var xhr = new XMLHttpRequest(); //创建XMLHttpRequest对象
        xhr.open(GM_param.method, GM_param.url, true);
        if (GM_param.responseType) xhr.responseType = GM_param.responseType;
        if (GM_param.overrideMimeType) xhr.overrideMimeType(GM_param.overrideMimeType);
        xhr.onreadystatechange = function() //设置回调函数
            {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200 && GM_param.onload)
                        GM_param.onload(xhr);
                    if (xhr.status !== 200 && GM_param.onerror)
                        GM_param.onerror(xhr);
                }
            }

        for (var header in GM_param.headers) {
            xhr.setRequestHeader(header, GM_param.headers[header]);
        }

        xhr.send(GM_param.data ? GM_param.data : null);
    }
}
//仿GM_getValue函数v1.0
if(typeof(GM_getValue) == "undefined")
{
	var GM_getValue = function(name, type){
		var value = localStorage.getItem(name);
		if (value == undefined) return value;
		if ((/^(?:true|false)$/i.test(value) && type == undefined) || type == "boolean")
		{
			if (/^true$/i.test(value))
				return true;
			else if (/^false$/i.test(value))
				return false;
			else
				return Boolean(value);
		}
		else if((/^\-?[\d\.]+$/i.test(value) && type == undefined) || type == "number")
			return Number(value);
		else
			return value;
	}
}
//仿GM_setValue函数v1.0
if(typeof(GM_setValue) == "undefined")
{
	var GM_setValue = function(name, value){
		localStorage.setItem(name, value);
	}
}
//仿GM_deleteValue函数v1.0
if(typeof(GM_deleteValue) == "undefined")
{
	var GM_deleteValue = function(name){
		localStorage.removeItem(name);
	}
}
//仿GM_listValues函数v1.0
if(typeof(GM_listValues) == "undefined")
{
	var GM_listValues = function(){
		var keys = [];
		for (var ki=0, kilen=localStorage.length; ki<kilen; ki++)
		{
			keys.push(localStorage.key(ki));
		}
		return keys;
	}
}

var ds = [];
var rowObj = function(){
	this.name = "";
	this.cname = [];
	this.info = [];
	this.tags = [];
	this.links = [];
}
rowObj.prototype.addTagFromName = function(rowObj)
{
	if (rowObj == undefined) rowObj = this;
	GM_xmlhttpRequest({
		method: "GET",
		//url: wiki_URL + (rowObj.name.length?"/"+rowObj.name:""),
		url: rowObj.links[0]?rowObj.links[0].href:(wiki_URL + (rowObj.name.length?"/"+rowObj.name:"")),
		onload: function(response) {
			var page_get_w = document.querySelector("#ETB_page-get");
			if (page_get_w)
			{
				var statetxt = page_get_w.querySelector(".page-get-" + rowObj.name);
				statetxt.classList.add("page-load");
				statetxt.innerHTML = "获取成功";
			}
			console.debug("正在处理 %s %s 页面",rowObj.name,
				rowObj.cname
					.filter(function(item){return item.type==0;})
					.map(function(item){return item.text;})
					.join("")
			);
			dealTags(response.responseText,rowObj);
		},
		onerror: function(response) {
			var page_get_w = document.querySelector("#ETB_page-get");
			if (page_get_w)
			{
				var statetxt = page_get_w.querySelector(".page-get-" + rowObj.name);
				statetxt.classList.add("page-load");
				statetxt.innerHTML = "页面获取错误";
			}
			rowsCurrent++;
		},
	});
}
var tagObj = function(){
	this.type = 0;
	this.name = "";
	this.cname = [];
	this.info = [];
	this.links = [];
}
//一条新的外部链接
var linkObj = function(text,href,title){
	this.text = text||"";
	this.href = href||"";
	this.title = title||"";
}


//处理版本的页面
function dealVersion(response)
{
	var PageDOM = new DOMParser().parseFromString(response, "text/html");
	var wiki_version_Dom;
	if (newRe)
	{ //新仓库的结构版本
		wiki_version_Dom = PageDOM.querySelector("#LC1");
	}else
	{ //wiki的结构版本
		wiki_version_Dom = PageDOM.querySelector("a[title='database-structure-version']");
	}

	if (!wiki_version_Dom)
	{
		alert("未找到数据库结构版本，你的 " + scriptName + " 版本可能已经不适用新的数据库，请更新你的脚本。");
		return;
	}
	var wiki_version = Number(wiki_version_Dom.textContent.replace(/\D/ig,""));

	var page_get_w = document.querySelector("#ETB_page-get");
	if (page_get_w)
	{
		var statetxt = page_get_w.querySelector(".page-get-wiki-version");
		statetxt.classList.add("page-load");
		statetxt.innerHTML = (newRe?"ETT组织仓库":"传统Wiki仓库")+"最新版本" + wiki_version + "，当前" + database_structure_version;
	}
	
	if (wiki_version > database_structure_version)
	{
		alert("Wiki数据库结构已更新，你的 " + scriptName + " 版本可能已经不适用新的数据库，请更新你的脚本。");
		return;
	}
}
//处理行的页面
function dealRows(response, dataset)
{
	var PageDOM = new DOMParser().parseFromString(response, "text/html");
	
	var page_get_w = document.querySelector("#ETB_page-get");
	if (page_get_w)
	{
		var statetxt = page_get_w.querySelector(".page-get-rows");
		statetxt.classList.add("page-load");
		statetxt.innerHTML = "获取成功";
	}

	var table = PageDOM.querySelector(newRe?"#readme .markdown-body table:nth-of-type(2)":"#wiki-body .markdown-body table").tBodies[0];
	
	rowsCount = table.rows.length;
	for(var ri=0, rilen=table.rows.length; ri<rilen; ri++)
	{
		var trow = table.rows[ri];
		var row = new rowObj;
		row.name = trow.cells[0].textContent.replace(/(^\s|\s$)/ig,""); //去除首尾空格;
		row.cname = InfoToArray(trow.cells[1]);
		row.info = InfoToArray(trow.cells[2]);
		row.links = LinksToArray(trow.cells[3]);
		row.addTagFromName();
		dataset.push(row);
		
		if (page_get_w)
		{
			page_get_w.querySelector(".select-menu-list").appendChild(
				buildMenuItem((function()    
					{
						var div = document.createElement("div");
						var span1 = document.createElement("span");
						span1.className = "page-title"; 
						span1.innerHTML = row.cname
											.filter(function(item){return item.type==0;})
											.map(function(item){return item.text;})
											.join(""); 
						div.appendChild(span1);
						var span2 = document.createElement("span");
						span2.className = "page-get-" + row.name;
						span2.innerHTML = "等待"; 
						div.appendChild(span2);
						return div;
					})()
				)
			);
		}
	}
}

//生成按钮
function specialCharToCss(str)
{
	var strn = str;
	strn = strn.replace("\\","\\\\");
	strn = strn.replace("\"","\\\"");
	strn = strn.replace("\r","");
	strn = strn.replace("\n","\\A");
	return strn;
}

//将外部链接变换为数组
function LinksToArray(linksDom)
{
	var arr = [];
	var as = linksDom.querySelectorAll("a");
	for (var ai=0;ai<as.length;ai++)
	{
    	var a = as[ai];
		arr.push(new linkObj(a.textContent,a.href,a.title));
	}
	return arr;
}
//介绍信息转为数组
function InfoToArray(infoDom)
{
	var arr = [];
	if (infoDom.childNodes != undefined)
	{
		for (var ci=0, cilen=infoDom.childNodes.length; ci<cilen; ci++)
		{
			var node = infoDom.childNodes[ci];
			//type，0是文字，1是换行，2是图片，3是链接
			var InfoObj = {type:0};
			switch (node.nodeName) {
				case "#text":case "G-EMOJI":
					InfoObj.type = 0;
					if (node.textContent == "\n")
						continue;
					InfoObj.text = node.textContent;
					break;
				case "BR":
					InfoObj.type = 1;
					break;
				case "IMG":
					InfoObj.type = 2;
					var osrc = node.getAttribute("data-canonical-src");
					if (osrc) //链接写在data-canonical-src
					{
						InfoObj.src = osrc;
					}else if(node.title.length > 0) //链接写在title
					{
						InfoObj.src = node.title;
					}else if(node.src.length > 0) //链接写在src
					{
						InfoObj.src = node.src;
					}else
					{
						console.error("发现未知的其他图片地址格式",node,"来自",infoDom);
					}
					InfoObj.alt = node.alt;
					break;
				case "A":
					InfoObj.type = 3;
					InfoObj.text = node.textContent;
					InfoObj.href = node.href;
					InfoObj.title = node.title;
					break;
				default: //未知的其他格式
					console.error("发现未知的其他Node格式：" + node.nodeName,node,"来自",infoDom);
					InfoObj.type = 0;
					InfoObj.text = node.textContent;
					continue;
			}
			arr.push(InfoObj);
		}
	}
	return arr;
}
//介绍信息数组输出到CSS
function InfoArrayToCssString(infoArr, creatImage)
{
	if (creatImage == undefined) creatImage = true;
	var infoArrTmp = infoArr.concat(); //创建编辑用临时数组
	var str = []; //最终输出的内容字符串的部件数组
	var lastText = false; //上一条是不是文字，用渝判断下一条是储存到临时数组等候拼接还是将前方的加入最终字符串
	var strPart = []; //当前的临时字符串（储存多块相邻文本，用于拼接）
	while (infoArrTmp.length>0)
	{
		var inf = infoArrTmp.shift();
		if (inf.type == 0 || inf.type == 1 || inf.type == 3) //type，0是文字，1是换行，2是图片，3是链接
		{ //处理文本
			if (lastText) //如果上一条不是文本
			{ //添加一条新的文本，或者换行
				strPart.push(inf.text || "\\A");
			}else
			{ //处理每一张图片
				str.push(strPart.map(function(item){return 'url("' + item + '")'}).join("")); //已储存的图片添加到最终字符串
				strPart = [];
				lastText = true;
				strPart.push(inf.text || "\\A");
			}
		}else if (creatImage) //如果同意生成图片，才处理图片
		{ //处理图片
			if (lastText)
			{ //处理每一条文本
				var txtTmp = strPart.join("");
				txtTmp = txtTmp.replace(/\"/igm,"\\\""); //将引号改为斜杠引号
				if (!creatImage) txtTmp = dealEmoji(txtTmp); //去除Emoji
				str.push('"' + txtTmp + '"');
				strPart = [];
				lastText = false;
				strPart.push(inf.src);
			}else
			{ //添加一张新的图片
				strPart.push(inf.src);
			}
		}
	}
	//最后没被处理掉的
	if (lastText)
	{ //处理每一条文本
		var txtTmp = strPart.join("");
		txtTmp = txtTmp.replace(/\"/igm,"\\\""); //将引号改为斜杠引号
		if (!creatImage) txtTmp = dealEmoji(txtTmp); //去除Emoji
		str.push('"' + txtTmp + '"');
		strPart = [];
		lastText = false;
	}else
	{ //处理每一张图片
		str.push(strPart.map(function(item){return 'url("' + item + '")'}).join(""));
		strPart = [];
		lastText = true;
	}
	return str.join("");
}

//处理Tag页面
function dealTags(response, rowdataset)
{
	var rowTags = rowdataset.tags;
	var PageDOM = new DOMParser().parseFromString(response, "text/html");

	var table = PageDOM.querySelector(newRe?"#readme .markdown-body table:nth-of-type(2)":"#wiki-body .markdown-body table");
	if (table == undefined)
	{
		alert(PageDOM.title + "\n该页面未发现数据表格，可能存在格式错误。")
		console.error("未发现表格",PageDOM.title);
	}
	var tBody = table.tBodies[0];
	
	for(var ri=0, rilen=tBody.rows.length; ri<rilen; ri++)
	{
		var trow = tBody.rows[ri];
		var tag = new tagObj;
		if (trow.cells.length > 2)
		{//没有足够单元格的跳过
			tag.name = trow.cells[0].textContent.replace(/(^\s|\s$)/ig,""); //去除首尾空格
			tag.cname = InfoToArray(trow.cells[1]);
			tag.info = InfoToArray(trow.cells[2]);
			tag.links = LinksToArray(trow.cells[3]);
			//type=0代表一行翻译，1代表注释
			tag.type = tag.name.replace(/\s/ig,"").length < 1 ? 1 : 0; //英文去除所有空格后如果没有文字，则算为注释
			if (tag.type != 1 && tag.cname.length < 1) //不是注释，中文名又没有文字
			{
				//console.error("发现无中文翻译行%d - %s:%s",ri,rowdataset.name,tag.name);
			}
			if (tag.type != 1 && rowTags.some(function(ttag){return ttag.name == tag.name;})) //从数组中搜索任一符合条件的，返回true
			{
				console.error("发现重复定义行%d - %s:%s",ri,rowdataset.name,tag.name);
			}
			rowTags.push(tag);
		}
		else
		{
			console.error("发现无3单元格的错误行%d %s",ri,tag.name);
		}
	}
	rowsCurrent++;
}

//点击开始任务按钮
function startProgram(dataset, mode){
	var downOver = startProgramCheck(dataset, mode);
	if (!downOver || downOverCheckHook == undefined)
	{
		GM_xmlhttpRequest({
			method: "GET",
			url: wiki_URL + "/" + wiki_version_filename,
			onload: function(response) {
				dealVersion(response.responseText);
				GM_xmlhttpRequest({
					method: "GET",
					url: wiki_URL + "/" + rows_filename,
					onload: function(response) {
						dealRows(response.responseText,dataset);
					}
				});
			},
			onerror: function(response) {
				dealVersion("");
				GM_xmlhttpRequest({
					method: "GET",
					url: wiki_URL + "/" + rows_filename,
					onload: function(response) {
						dealRows(response.responseText,dataset);
					}
				});
			},
		});
		downOverCheckHook = setInterval(function () { startProgramCheck(dataset, mode) }, 200);
	}
	if (!downOver)
	{
		buildDownloadProgress();
	}
}

//创建下载进度窗口
function buildDownloadProgress()
{
	var page_get_w = document.querySelector("#ETB_page-get");
	if (!page_get_w)
	{
		windowInserPlace.appendChild(buildMenuModal("window", "ETB_page-get", "数据获取进度", null, [
			buildMenuList([
				buildMenuItem((function()    
					{
						var div = document.createElement("div");
						var span1 = document.createElement("span");
						span1.className = "page-title"; 
						span1.innerHTML = "Wiki结构版本"; 
						div.appendChild(span1);
						var span2 = document.createElement("span");
						span2.className = "page-get-wiki-version";
						span2.innerHTML = "等待"; 
						div.appendChild(span2);
						return div;
					})()
				),
				buildMenuItem((function()    
					{
						var div = document.createElement("div");
						var span1 = document.createElement("span");
						span1.className = "page-title"; 
						span1.innerHTML = "列表页面"; 
						div.appendChild(span1);
						var span2 = document.createElement("span");
						span2.className = "page-get-rows";
						span2.innerHTML = "等待"; 
						div.appendChild(span2);
						return div;
					})()
				),
			])
		],
		[
			".ETB_page-get .page-title" + "{\r\n" + [
				'font-weight: bold',
				'margin-right: 15px',
			].join(';\r\n') + "\r\n}",
			".ETB_page-get .page-load" + "{\r\n" + [
				'color: #0A0',
			].join(';\r\n') + "\r\n}",
		].join('\r\n')
		));
	}
	else
	{
		page_get_w.style.display = "block";
	}
}

//检测下载完成情况
function startProgramCheck(dataset, mode)
{
	if (rowsCount > 0 && rowsCurrent >= rowsCount)
	{
		console.debug("获取完成");
		clearInterval(downOverCheckHook);
		switch (mode) {
			case 1:
				buildJSOutput(dataset);
				break;
			case 0:
			default:
				buildCSSOutput(dataset);
				break;
		}
		var page_get_w = document.querySelector("#ETB_page-get");
		if (page_get_w)
		{
			page_get_w.parentNode.removeChild(page_get_w);
		}
		return true;
	}
	else
	{
		console.debug("获取%d/%d",rowsCurrent, rowsCount);
		return false;
	}
}

//获取完成后创建CSS输出窗口
function buildCSSOutput(dataset)
{
	var css = createOutputCSS(dataset
		,GM_getValue("ETB_create-info","boolean")
		,GM_getValue("ETB_create-info-image","boolean")
		,GM_getValue("ETB_create-cname-image","boolean")
		);
	var downBlob = new Blob([css], {'type': 'text\/css'});
	var downurl = window.URL.createObjectURL(downBlob);
	
	var css_output_w = document.querySelector("#ETB_css-output");
	if (!css_output_w)
	{
		windowInserPlace.appendChild(buildMenuModal("window", "ETB_css-output", "用户样式版EhTagTranslator", null,
			[
				buildMenuList([
					buildMenuItem("CSS文本",
						(function()    
						{
							var textarea = document.createElement("textarea");
							textarea.id = "ETB_css-textarea";
							textarea.name = textarea.id;
							textarea.className = "txta " + textarea.id;
							textarea.value = css;
							textarea.wrap = "off";
							textarea.setAttribute("readonly",true);
							return textarea;
						})()
						,buildSVG("css")),
					buildMenuItem("直接下载CSS文件",null,buildSVG("download"),downurl,1),
				])
			],
			[
				".ETB_css-output .txta" + "{\r\n" + [
					'resize: vertical',
					'width:100%',
					'height:300px',
				].join(';\r\n') + "\r\n}",
			].join('\r\n')
		));
	}
	else
	{
		css_output_w.style.display = "block";
		css_output_w.querySelector(".ETB_css-textarea").value = css;
		css_output_w.querySelector("a").href = downurl;
	}
}

//开始构建CSS
function createOutputCSS(dataset, createInfo, createInfoImage, createCnameImage)
{
	if (createInfo == undefined) createInfo = true;
	if (createInfoImage == undefined) createInfoImage = true;
	if (createCnameImage == undefined) createCnameImage = true;
	var date = new Date();
	
	var cssAry = [];
//样式信息说明
	cssAry.push(
 "/* EhTagTranslator 用户样式版，由 " + scriptName + " v" + scriptVersion + " 构建"
," * 数据来源于" + wiki_URL
," * 构建时间为"
," * " + date.toString()
," */"
	)
//样式命名区间
	cssAry.push(
//▼CSS内容部分
 "@namespace url(http://www.w3.org/1999/xhtml);"
//▲CSS内容部分
	);

//表里通用样式
	cssAry.push(""
//▼CSS内容部分
,"/* 表里通用样式 */"
,"@-moz-document"
,"    domain('exhentai.org'),"
,"    domain('e-hentai.org')"
,"{"
,GM_getValue("ETB_global-style")
,"}"
//▲CSS内容部分
	);

//表站样式
	cssAry.push(""
//▼CSS内容部分
,"/* 表站样式 */"
,"@-moz-document"
,"    domain('e-hentai.org')"
,"{"
,GM_getValue("ETB_global-style-eh")
,"}"
//▲CSS内容部分
	);

//里站样式
	cssAry.push(""
//▼CSS内容部分
,"/* 里站样式 */"
,"@-moz-document"
,"    domain('exhentai.org')"
,"{"
,GM_getValue("ETB_global-style-ex")
,"}"
//▲CSS内容部分
	);

//翻译内容
	cssAry.push(""
//▼CSS内容部分
,"/* 翻译内容 */"
,"@-moz-document"
,"    domain('exhentai.org'),"
,"    domain('e-hentai.org')"
,"{"
//▲CSS内容部分
	);

	dataset.forEach(function(row){

//添加行名的注释
		cssAry.push(""
,"/* " + row.name
," * " + row.cname
			.filter(function(item){return item.type==0;})
			.map(function(item){return item.text;})
			.join("")
," */"
		);

	row.tags.forEach(function(tag){

		if (tag.type == 0)
		{
			var tagid = (row.name=="misc"?"":row.name + ":") + tag.name.replace(/\s/ig,"_");
			cssAry.push(""
//▼CSS内容部分
,"  a[id=\"ta_" + tagid + "\"]{"
,"    font-size:0;"
,"  }"
,"  a[id=\"ta_" + tagid + "\"]::before{"
,"    content:" + InfoArrayToCssString(tag.cname, createCnameImage) + ";"
,"  }"
//▲CSS内容部分
			);
			if (createInfo)
			{
				var sinfo = InfoArrayToCssString(tag.info, createInfoImage);
				if (sinfo.replace(/\s/ig,"").length > 0)
				{
					cssAry.push(""
//▼CSS内容部分
,"  a[id=\"ta_" + tagid + "\"]::after{"
,"    content:" + sinfo + ";"
,"  }"
//▲CSS内容部分
					);
				}
			}
		}
		else
		{ //将注释写成CSS注释
			cssAry.push(
 "/* " + InfoArrayToCssString(tag.cname, false)
," * " + InfoArrayToCssString(tag.info, false)
," */"
			);
		}
			
	})//row.tags.forEach
	});//dataset.forEach

	cssAry.push(
//▼CSS内容部分
 "}"
//▲CSS内容部分
	);
	
	var css = cssAry.join("\r\n");
	return css;
}

//获取完成后创建JS输出窗口
function buildJSOutput(dataset)
{
	var json = createOutputJSON(dataset
		,GM_getValue("ETB_create-info","boolean")
		,GM_getValue("ETB_create-info-image","boolean")
		,GM_getValue("ETB_create-cname-image","boolean")
		);
	var jsonStr = JSON.stringify(json);
	var downBlob = new Blob([jsonStr], {'type': 'text\/json'});
	var downurl = window.URL.createObjectURL(downBlob);
	
	var js_output_w = document.querySelector("#ETB_js-output");
	if (!js_output_w)
	{
		windowInserPlace.appendChild(buildMenuModal("window", "ETB_js-output", "用户脚本版EhTagTranslator数据库", null,
			[
				buildMenuList([
					buildMenuItem("JSON文本",
						(function()    
						{
							var textarea = document.createElement("textarea");
							textarea.id = "ETB_js-textarea";
							textarea.name = textarea.id;
							textarea.className = "txta " + textarea.id;
							textarea.value = jsonStr;
							textarea.setAttribute("readonly",true);
							return textarea;
						})()
						,buildSVG("json")),
					buildMenuItem("数据库数量",
						(function()    
						{
							var tb = document.createElement("table");
							tb.id = "ETB_database-count";
							tb.name = tb.id;
							tb.className = tb.id;
							//正式开始构建内容
							//tHead
							tb.createTHead();
							var th = tb.tHead.insertRow();
							th.insertCell().appendChild(document.createTextNode("行名"));
							th.insertCell().appendChild(document.createTextNode("数据行数"));
							th.insertCell().appendChild(document.createTextNode("注释行数"));
							//tBody
							json.dataset.forEach(function(item){
								var tr = tb.insertRow();
								tr.insertCell().appendChild(document.createTextNode(item.cname
									.filter(function(item){return item.type==0;})
									.map(function(item){return item.text;})
									.join("")));
								tr.insertCell().appendChild(document.createTextNode(item.tags.filter(function(item){return item.type==0}).length));
								tr.insertCell().appendChild(document.createTextNode(item.tags.filter(function(item){return item.type==1}).length));
							})
							return tb;
						})()
						,buildSVG("book")),
					buildMenuItem("直接下载JSON文件",null,buildSVG("download"),downurl,1)
				])
			],
			[
				".ETB_js-output .txta" + "{\r\n" + [
					'resize: vertical',
					'width:100%',
					'height:200px',
				].join(';\r\n') + "\r\n}",
				"#ETB_js-output .select-menu-list" + "{\r\n" + [
					'max-height: 700px',
				].join(';\r\n') + "\r\n}",
				"#ETB_database-count,#ETB_database-count td" + "{\r\n" + [
					'border: solid 1px lightgrey;',
				].join(';\r\n') + "\r\n}",
			].join('\r\n')
		));
	}
	else
	{
		js_output_w.style.display = "block";
		js_output_w.querySelector(".ETB_js-textarea").value = jsonStr;
		js_output_w.querySelector("a").href = downurl;
	}
}

//开始构建JSON
function createOutputJSON(dataset, createInfo, createInfoImage, createCnameImage)
{
	if (createInfo == undefined) createInfo = true;
	if (createInfoImage == undefined) createInfoImage = true;
	if (createCnameImage == undefined) createCnameImage = true;

	var outArray =
	/*
	 * 生成一个不会干涉到原对象的Row对象
	 */ 
	dataset.map(function(row_orignal){
		var row = Object.assign(new rowObj(), row_orignal);
		row.cname=row_orignal.cname
			.filter(function(item){return createCnameImage || item.type != 2;})
			.map(function(item){
				var newItem = Object.assign({}, item);
				if(!createCnameImage && item.text) {
					newItem.text = dealEmoji(item.text);
				}
				return newItem;
			});
		if (createInfo)
		{
			row.info=row_orignal.info
				.filter(function(item){return createInfoImage || item.type != 2;})
				.map(function(item){
					var newItem = Object.assign({}, item);
					if(!createInfoImage && item.text) {
						newItem.text = dealEmoji(item.text);
					}
					return newItem;
				});
		}
		else
		{
			row.info = null;
		}
		row.links=row_orignal.links
			.map(function(item){
				var newItem = Object.assign(new linkObj(), item);
				return newItem;
			});

		row.tags =
		/*
		 * 生成一个不会干涉到原对象的Tag对象
		 */ 
		row_orignal.tags.map(function(tag_orignal){
			var tag = Object.assign(new tagObj(), tag_orignal);
			tag.cname=tag_orignal.cname
				.filter(function(item){return createCnameImage || item.type != 2;})
				.map(function(item){
					var newItem = Object.assign({}, item);
					if(!createCnameImage && item.text) {
						newItem.text = dealEmoji(item.text);
					}
					return newItem;
				});
			tag.links=tag_orignal.links
				.map(function(item){
					var newItem = Object.assign(new linkObj(), item);
					return newItem;
				});

			if (createInfo || tag.type==1)
			{
				tag.info=tag_orignal.info
					.filter(function(item){return createInfoImage || item.type != 2;})
					.map(function(item){
						var newItem = Object.assign({}, item);
						if(!createInfoImage && item.text) {
							newItem.text = dealEmoji(item.text);
						}
						return newItem;
					});
			}
			else
			{
				tag.info = null;
			}
			return tag;
		})//row.tags.forEach

		return row;
	});//dataset.forEach

	var date = new Date();
	var outJson = 
	{
		"scriptName":scriptName,
		"scriptVersion":scriptVersion,
		"database-structure-version":database_structure_version,
		"date":date.getTime(),
		"dataset":outArray
	}
	return outJson;
}

//去除文本中的Emoji字符
function dealEmoji(str)
{
	return str.replace(emojireg,"");
}

//生成按钮
function buildButton(title, icon, modal)
{
	var li = document.createElement("li");
	var select_menu = document.createElement("div");
	select_menu.className = "select-menu js-menu-container js-select-menu";
	li.appendChild(select_menu);
	var button = document.createElement("button");
	button.className = "btn btn-sm select-menu-button js-menu-target css-truncate";
	button.onclick = function(){
		modal.style.display = "block";
	}
	select_menu.appendChild(button);
	var span = document.createElement("span");
	span.className = "js-select-button";
	if (icon != undefined)
		span.appendChild(icon);
	span.innerHTML += title;
	button.appendChild(span);
	select_menu.appendChild(modal);
	
	button.onclick = function(){
		modal.style.display = "block";
	}
	return li;
}

//生成菜单窗口
function buildMenuModal(mode, id, stitle, filters, lists, sstyle)
{
	
	var modal_holder = document.createElement("div");
	modal_holder.className = "select-menu-modal-holder js-menu-content js-navigation-container js-active-navigation-container";
	if (id != undefined)
	{
		modal_holder.id = id;
		modal_holder.classList.add(id);
	}
	if (sstyle != undefined)
	{
		var style = document.createElement("style");
		style.innerHTML = sstyle;
		modal_holder.appendChild(style);
	}

	var modal = document.createElement("div");
	modal.className = "select-menu-modal subscription-menu-modal js-menu-content";
	modal_holder.appendChild(modal);
	
	var header = document.createElement("div");
	header.className = "select-menu-header js-navigation-enable";
	modal.appendChild(header);
	
	var CloseSvg = buildSVG("Close");
	header.appendChild(CloseSvg);
	CloseSvg.onclick = function(){
		modal_holder.style.display = "none";
	}

	switch (mode) {
		case "window":
			modal_holder.style.display = "block";
	}
	
	var title = document.createElement("span");
	title.className = "select-menu-title";
	title.innerHTML = stitle;
	header.appendChild(title);

	if (lists != undefined)
	{
		for(var li = 0, lilen=lists.length; li<lilen; li++)
		{
			var list = lists[li];
			if (list)
				modal.appendChild(list);
		}
	}
	return modal_holder;
}

//构建一个菜单列表框架
function buildMenuList(items)
{
	var list = document.createElement("div");
	list.className = "select-menu-list js-navigation-container";
	if (items != undefined)
	{
		for(var ii=0, lilen=items.length; ii<lilen; ii++)
		{
			var item = items[ii];
			if (item)
				list.appendChild(item);
		}
	}
	return list;
}

//构建一个菜单列表项
function buildMenuItem(heading, description, icon, callback, type)
{
	if (heading == undefined) heading = "未设定";
	
	var item = document.createElement("div");
	if (type == 3)
	{
		var item = document.createElement("label");
		item.setAttribute('for', callback);
	}
	else if (typeof(callback) == "string")
	{
		var item = document.createElement("a");
		item.target = "_blank";
		item.href = callback;
	}
	else
	{
		if (callback) item.onclick = callback;
	}
	
	item.className = "select-menu-item";
	
	switch (type) {
		case 0:
			item.classList.add("js-navigation-item");
			break;
		case 1:
			item.classList.add("select-menu-action");
			break;
		default:
			break;
	}
	
	if (icon != undefined) item.appendChild(icon);
		
	var item_text = document.createElement("div");
	item_text.className = "select-menu-item-text";
	item.appendChild(item_text);
	
	if (description != undefined)
	{
		var item_heading = document.createElement("span");
		item_heading.className = "select-menu-item-heading";
		if (typeof(heading)=="string")
			item_heading.innerHTML = heading;
		else
			item_heading.appendChild(heading);
		var item_description = document.createElement("span");
		item_description.className = "description";
		if (typeof(description)=="string")
			item_description.innerHTML = description;
		else
			item_description.appendChild(description);
		item_text.appendChild(item_heading);
		item_text.appendChild(item_description);
	}
	else
	{
		if (typeof(heading)=="string")
			item_text.innerHTML = heading;
		else
			item_text.appendChild(heading);
	}
	return item;
}
//生成svg
function buildSVG(mode,check)
{
	if (check == undefined) check = false;
	var CloseSvgDiv = document.createElement("div");
	var innerHTML = "";
	switch (mode) {
		case "Close":
			innerHTML = '<svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z"/></svg>';
			break;

		case "Settings":
			innerHTML = '<svg width="14" viewBox="0 0 14 16" version="1.1" height="16" class="octicon octicon-question select-menu-item-icon" aria-hidden="true"><path d="M14 8.77V7.17l-1.94-0.64-0.45-1.09 0.88-1.84-1.13-1.13-1.81 0.91-1.09-0.45-0.69-1.92H6.17l-0.63 1.94-1.11 0.45-1.84-0.88-1.13 1.13 0.91 1.81-0.45 1.09L0 7.23v1.59l1.94 0.64 0.45 1.09-0.88 1.84 1.13 1.13 1.81-0.91 1.09 0.45 0.69 1.92h1.59l0.63-1.94 1.11-0.45 1.84 0.88 1.13-1.13-0.92-1.81 0.47-1.09 1.92-0.69zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';
			break;

		case "check":
			innerHTML = '<svg width="12" viewBox="0 0 12 16" version="1.1" height="16" class="octicon octicon-check select-menu-item-icon" aria-hidden="true"><path d="M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z"/></svg>';
			break;

		case "question":
			innerHTML = '<svg width="14" viewBox="0 0 14 16" version="1.1" height="16" class="octicon octicon-question select-menu-item-icon" aria-hidden="true"><path d="M6 10h2v2H6V10z m4-3.5c0 2.14-2 2.5-2 2.5H6c0-0.55 0.45-1 1-1h0.5c0.28 0 0.5-0.22 0.5-0.5v-1c0-0.28-0.22-0.5-0.5-0.5h-1c-0.28 0-0.5 0.22-0.5 0.5v0.5H4c0-1.5 1.5-3 3-3s3 1 3 2.5zM7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z"/></svg>';
			break;

		case "download":
			innerHTML = '<svg width="16" viewBox="0 0 16 16" version="1.1" height="16" class="octicon octicon-desktop-download select-menu-item-icon" aria-hidden="true"><path d="M4 6h3V0h2v6h3L8 10 4 6z m11-4H11v1h4v8H1V3h4v-1H1c-0.55 0-1 0.45-1 1v9c0 0.55 0.45 1 1 1h5.34c-0.25 0.61-0.86 1.39-2.34 2h8c-1.48-0.61-2.09-1.39-2.34-2h5.34c0.55 0 1-0.45 1-1V3c0-0.55-0.45-1-1-1z"/></svg>';
			break;

		case "book":
			innerHTML = '<svg width="16" viewBox="0 0 16 16" version="1.1" height="16" class="octicon octicon-book select-menu-item-icon" aria-hidden="true"><path d="M2 5h4v1H2v-1z m0 3h4v-1H2v1z m0 2h4v-1H2v1z m11-5H9v1h4v-1z m0 2H9v1h4v-1z m0 2H9v1h4v-1z m2-6v9c0 0.55-0.45 1-1 1H8.5l-1 1-1-1H1c-0.55 0-1-0.45-1-1V3c0-0.55 0.45-1 1-1h5.5l1 1 1-1h5.5c0.55 0 1 0.45 1 1z m-8 0.5l-0.5-0.5H1v9h6V3.5z m7-0.5H8.5l-0.5 0.5v8.5h6V3z"/></svg>';
			break;
		
		case "code":
			innerHTML = '<svg width="14" viewBox="0 0 14 16" version="1.1" height="16" class="octicon octicon-code select-menu-item-icon" aria-hidden="true"><path d="M9.5 3l-1.5 1.5 3.5 3.5L8 11.5l1.5 1.5 4.5-5L9.5 3zM4.5 3L0 8l4.5 5 1.5-1.5L2.5 8l3.5-3.5L4.5 3z"/></svg>'
			break;
			
		case "css":
			innerHTML = '<svg width="16" height="16" viewBox="0 0 64 64" version="1.1" class="octicon octicon-question select-menu-item-icon"><defs><path d="M0 14.995C0 6.714 6.713 0 14.995 0h34.01C57.286 0 64 6.713 64 14.995v34.01C64 57.287 57.287 64 49.005 64h-34.01C6.714 64 0 57.287 0 49.005v-34.01z" id="a"/></defs><g fill="none" fill-rule="evenodd"><mask id="b" fill="#fff"><use xlink:href="#a"/></mask><use fill-opacity="0" fill="#FFF" xlink:href="#a"/><path fill="#2ECC71" mask="url(#b)" d="M30 0v39H0V0z"/><path fill="#E74C3C" mask="url(#b)" d="M64 0v21H34V0z"/><path fill="#F39C12" mask="url(#b)" d="M30 43v21H0V43z"/><path fill="#3498DB" mask="url(#b)" d="M64 25.5v39H34v-39z"/></g></svg>';
			break;

		case "json":
			innerHTML = '<svg viewBox="0 0 16 16" height="15" width="16" version="1.1" class="octicon octicon-code select-menu-item-icon"><defs><style>.cls-1{fill:url(#linearGradient_1);}.cls-2{fill:url(#linearGradient_2);}</style><linearGradient gradientUnits="userSpaceOnUse" gradientTransform="matrix(1, 0, 0, -1, 688.46, -371.22)" y2="-385.5" x2="-675.75" y1="-374.22" x1="-687.04" id="linearGradient_1"><stop offset="0"/><stop stop-color="#fff" offset="1"/></linearGradient><linearGradient xlink:href="#linearGradient_1" y2="-373.71" x2="-686.52" y1="-384.99" x1="-675.24" id="linearGradient_2"/></defs><path style="fill:url(#linearGradient_1)" d="M8,11.91c3.54,4.83,7-1.35,7-5.06C15,2.46,10.53,0,8,0A8.07,8.07,0,0,0,0,8a8.06,8.06,0,0,0,8,8c-0.8-.11-3.45-0.68-3.49-6.8C4.47,5.07,5.85,3.42,8,4.14A4.06,4.06,0,0,1,10.33,8,4.08,4.08,0,0,1,8,11.91Z" class="cls-1"/><path style="fill:url(#linearGradient_2)" d="M8,4.14c-2.34-.81-5.2,1.12-5.2,5C2.78,15.43,7.45,16,8,16a8.07,8.07,0,0,0,8-8A8.06,8.06,0,0,0,8,0c1-.13,5.25,1.05,5.25,6.9,0,3.81-3.2,5.89-5.27,5A4.06,4.06,0,0,1,5.65,8,4.1,4.1,0,0,1,8,4.14Z" class="cls-2"/></svg>';
			break;

		case "eh":
			innerHTML = '<svg class="octicon" style="margin:2px 2px;" width="12" height="12" viewBox="0 0 180 180" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="EH" fill="#000000" transform="translate(0.000000, 13.000000)"><polygon id="Path-2" points="0 0.202883984 0 153.452455 63.9237403 153.452455 63.9237403 128.434878 25.3357783 128.434878 25.3357783 89.8192926 51.0881973 89.8192926 51.0881973 64.4842269 25.815364 64.4842269 25.815364 26.0161147 63.9458219 26.0161147 63.9458219 0"></polygon><polygon id="Path-3" points="102.413793 0.499934441 102.413793 153.799341 128.267497 153.799341 128.267497 89.8145927 153.883139 89.8145927 153.883139 153.360711 179.611922 153.360711 179.611922 0 154.060738 0 154.060738 63.8323757 128.389266 63.8323757 128.389266 0.125830495"></polygon><rect id="Rectangle" x="63.6206897" y="64.9220339" width="26.3793103" height="26.2779661"></rect></g></svg>';
			break;
			
		default:
			innerHTML = '<svg width="12" viewBox="0 0 12 16" version="1.1" height="16" class="octicon octicon-check select-menu-item-icon" aria-hidden="true"></svg>';
			break;
	}
	CloseSvgDiv.innerHTML = innerHTML;
	var CloseSvg = CloseSvgDiv.firstChild;
	if(check)
		CloseSvg.classList.add("octicon-check");
	else
		CloseSvg.classList.remove("octicon-check");
	
	//更改SVG的渐变ID名
	function changeSvgIdName(svg)
	{
		var linearGradient = svg.getElementsByTagName("linearGradient");
		for (var lGi=0, lGilen=linearGradient.length;lGi<lGilen;lGi++)
		{
			var idName = linearGradient[lGi].id;
			var idIndex = 0;
			while(document.querySelector("#" + idName + "_" + idIndex.toString()))
			{
				idIndex++;
			}
			linearGradient[lGi].id = idName + "_" + idIndex.toString();
			var idReg = new RegExp("#" + idName + "", "igm"); //P站图片地址正则匹配式
			svg.innerHTML = svg.innerHTML.replace(idReg,"#" + idName + "_" + idIndex.toString());
		}
		return svg;
	}
	CloseSvg = changeSvgIdName(CloseSvg);

	return CloseSvg;
}
//打开设置窗口
function startOption()
{
	var option_modal_w = document.querySelector("#ETB_option");
	if (!option_modal_w)
	{
		windowInserPlace.appendChild(
			buildMenuModal("window", "ETB_option", scriptName + " 设置", null, [
					buildMenuList([
						buildMenuItem("生成简介","生成光标移动到Tag上时出现的简介。",
							(function(){
								var chk = document.createElement("input");
								chk.type = "checkbox";
								chk.id = "ETB_create-info";
								chk.name = chk.id;
								chk.className = "octicon octicon-question select-menu-item-icon " + chk.id;
								return chk;
							})()
							,"ETB_create-info",3),
						buildMenuItem("生成简介图片和Emoji","生成简介中的图片和绘文字。",
							(function(){
								var chk = document.createElement("input");
								chk.type = "checkbox";
								chk.id = "ETB_create-info-image";
								chk.name = chk.id;
								chk.className = "octicon octicon-question select-menu-item-icon " + chk.id;
								return chk;
							})()
							,"ETB_create-info-image",3),
						buildMenuItem("生成中文名图片和Emoji","生成中文名中的图片和绘文字，一般为名称前的小图标。",
							(function(){
								var chk = document.createElement("input");
								chk.type = "checkbox";
								chk.id = "ETB_create-cname-image";
								chk.name = chk.id;
								chk.className = "octicon octicon-question select-menu-item-icon " + chk.id;
								return chk;
							})()
							,"ETB_create-cname-image",3),
						buildMenuItem("Tag通用样式",
							(function(){
								var div = document.createElement("div");
								var span1 = document.createElement("div");
								span1.innerHTML = "Tag统一应用的样式，可修改为自己喜爱的样式。"; 
								div.appendChild(span1);
								//表里共用
								var textarea = document.createElement("textarea");
								textarea.id = "ETB_global-style";
								textarea.name = textarea.id;
								textarea.className = "txta " + textarea.id;
								textarea.wrap = "off";
								var label = document.createElement("label");
								label.setAttribute('for', textarea.id);
								label.innerHTML = "表里共用样式";
								div.appendChild(label);
								div.appendChild(textarea);
								//表站
								var textarea = document.createElement("textarea");
								textarea.id = "ETB_global-style-eh";
								textarea.name = textarea.id;
								textarea.className = "txta " + textarea.id;
								textarea.wrap = "off";
								var label = document.createElement("label");
								label.setAttribute('for', textarea.id);
								label.innerHTML = "表站样式";
								div.appendChild(label);
								div.appendChild(textarea);
								//里站
								var textarea = document.createElement("textarea");
								textarea.id = "ETB_global-style-ex";
								textarea.name = textarea.id;
								textarea.className = "txta " + textarea.id;
								textarea.wrap = "off";
								var label = document.createElement("label");
								label.setAttribute('for', textarea.id);
								label.innerHTML = "里站样式";
								div.appendChild(label);
								div.appendChild(textarea);
								return div;
							})()
							,buildSVG("css")),
					]),
					buildMenuList([
						buildMenuItem("其他用户分享的通用样式",null,buildSVG("code"),"https://github.com/Mapaler/EhTagTranslator/labels/%E6%A0%B7%E5%BC%8F%E5%88%86%E4%BA%AB",1),
						buildMenuItem(
							(function(){
								var div = document.createElement("div");
								var btn = document.createElement("button");
								btn.innerHTML = "重置";
								btn.id = "ETB_reset-option";
								btn.name = btn.id;
								btn.className = "btn btn-sm btn-danger " + btn.id;
								btn.onclick = function(){
									resetOption();
								}
								div.appendChild(btn);
								/*
								var btn2 = document.createElement("button");
								btn2.innerHTML = "取消";
								btn2.className = "btn btn-sm";
								div.appendChild(btn2);
								*/
								var btn = document.createElement("button");
								btn.innerHTML = "保存";
								btn.id = "ETB_save-option";
								btn.name = btn.id;
								btn.className = "btn btn-sm btn-primary " +　btn.id;
								btn.onclick = function(){
									saveOption();
								}
								div.appendChild(btn);
								return div;
							})()
							,null,null,null,1),
					]),
				],
				[
					".ETB_option .select-menu-item-text" + "{\r\n" + [
						'font-weight: normal',
					].join(';\r\n') + "\r\n}",
					".ETB_option .txta" + "{\r\n" + [
						'resize: vertical',
						'width: 100%',
						'height: 100px',
					].join(';\r\n') + "\r\n}",
					".ETB_option .ETB_save-option" + "{\r\n" + [
						'float: right',
					].join(';\r\n') + "\r\n}",
				].join('\r\n')
			)
		);
	}
	else
	{
		option_modal_w.style.display = "block";
	}
}
//重置设置
function resetOption(part)
{
	function partReset(name,value,ispart)
	{
		if (!ispart || ispart && GM_getValue(name) == undefined)
			GM_setValue(name, value);
	}
	var cssAry = [];
	var cssAry_eh = [];
	var cssAry_ex = [];
	cssAry.push(
//▼CSS内容部分
 "  #taglist a{"
,"    background:inherit;"
,"    border-color: inherit;"
,"  }"
,"  #taglist a::before{"
,"    font-size:12px;"
,"  }"
,"  #taglist a::after{"
,"    background: inherit;"
,"    border-style: solid;"
,"    border-width: 1px;"
,"    border-color: inherit;"
,"    border-radius:5px;"
,"    font-size:12pt;"
,"    float:left;"
,"    position:fixed;"
,"    z-index:999;"
,"    padding:2px;"
,"    box-shadow: 3px 3px 5px #888;"
,"    min-width:150px;"
,"    max-width:300px;"
,"    white-space:pre-wrap;"
,"    opacity: 0;"
,"    transition: opacity 0.2s;"
,"    transform: translate(30px,25px);"
,"    top:0px;"
,"    pointer-events:none;"
,"  }"
,"  #taglist a:hover::after,#taglist a:focus::after{"
,"    opacity: 1;"
,"    transition: opacity 0.5s;"
,"  }"
//▲CSS内容部分
	);
	cssAry_eh.push(
//▼CSS内容部分
 "  #taglist a::after{"
,"    color:#5c0d11;"
,"  }"
//▲CSS内容部分
	);
	cssAry_ex.push(
//▼CSS内容部分
 "  #taglist a::after{"
,"    color:#dddddd;"
,"  }"
//▲CSS内容部分
	);
	
	partReset("ETB_option-version",optionVersion,part);
	
	partReset("ETB_create-info","true",part);
	partReset("ETB_create-info-image","true",part);
	partReset("ETB_create-cname-image","true",part);
	partReset("ETB_global-style",cssAry.join("\r\n"),part);
	partReset("ETB_global-style-eh",cssAry_eh.join("\r\n"),part);
	partReset("ETB_global-style-ex",cssAry_ex.join("\r\n"),part);
	
	reloadOption();
}
//访问设置用递归函数
function visitChildNodes(dom, callback)
{
	callback(dom);
	for (var ci=0, cilen=dom.childNodes.length; ci<cilen; ci++)
	{
		visitChildNodes(dom.childNodes[ci], callback);
	}
}
//保存设置
function saveOption()
{
	var option_modal_w = document.querySelector("#ETB_option");
	if (option_modal_w)
	{
		 visitChildNodes(option_modal_w,setValue);
	}
	function setValue(dom)
	{
		if (dom.name && dom.value != undefined)
		{
			if (dom.type == "checkbox")
				GM_setValue(dom.name, dom.checked);
			else
				GM_setValue(dom.name, dom.value);
		}
	}
	option_modal_w.style.display = "none";
}
//重新加载设置窗口
function reloadOption()
{
	var option_modal_w = document.querySelector("#ETB_option");
	if (option_modal_w)
	{
		 visitChildNodes(option_modal_w, getValue);
	}
	function getValue(dom)
	{
		if (dom.name && dom.value != undefined)
		{
			var value = GM_getValue(dom.name);
			if (value != undefined)
			{
				if (dom.type != undefined && dom.type == "checkbox")
					dom.checked = value;
				else
					dom.value = value;
			}
		}
	}
}


/*
 * 开始实际执行的程序
 */

if (!GM_getValue("ETB_option-version"))
{
	resetOption(false); //新用户重置设置
}
else if (GM_getValue("ETB_option-version", "number") < optionVersion)
{ //老用户提醒更改设置
	alert(scriptName + " 本次程序版本更新改变了设置结构，建议先重置设置，否则可能会导致无法正常使用。");
	resetOption(true);
}

var menu_modal = buildMenuModal("menu", null, "请选择任务 v" + scriptVersion, null, [
		buildMenuList([
			buildMenuItem("生成CSS","生成用户样式版EhTagTranslator，请使用Stylus扩展安装。安卓火狐也可使用。",buildSVG("css"),function(){
					startProgram(ds,0);
				}
			,0),
			buildMenuItem("生成JSON","为第三方程序生成EhTagTranslator数据库。",buildSVG("json"),function(){
					startProgram(ds,1);
				}
			,0)
		]),
		buildMenuList([
			buildMenuItem("选项",null,buildSVG("Settings"),function(){startOption();reloadOption();},1),
			//buildMenuItem("查看使用帮助",null,buildSVG("question"),"https://github.com/Mapaler/EhTagTranslator/blob/master/README.md",1),
			buildMenuItem("参与补全翻译",null,buildSVG("book"),"https://github.com/Mapaler/EhTagTranslator/wiki",1),
		])
	]);
	
buttonInserPlace.insertBefore(buildButton(" " + scriptName + " ", buildSVG("eh"), menu_modal),buttonInserPlace.querySelector("li"));
})();
