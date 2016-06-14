// ==UserScript==
// @name        EhTagBuilder
// @name:zh-CN	E绅士标签构建者
// @namespace   http://www.mapaler.com/
// @description Build EhTagTranslater from Wiki.
// @description:zh-CN	从Wiki获取EhTagTranslater数据库，将E绅士TAG翻译为中文
// @include     *://github.com/Mapaler/EhTagTranslator*
// @icon        http://exhentai.org/favicon.ico
// @version     2.2.1
// @grant       none
// @copyright	2016+, Mapaler <mapaler@163.com>
// ==/UserScript==

(function() {
var wiki_URL="https://github.com/Mapaler/EhTagTranslator/wiki"; //GitHub wiki 的地址
var rows_title="rows"; //行名的地址
var buttonInserPlace = document.getElementsByClassName("pagehead-actions")[0]; //按钮插入位置
var windowInserPlace = document.getElementsByClassName("reponav")[0]; //窗口插入位置
var scriptName = typeof(GM_info)!="undefined" ? (GM_info.script.localizedName ? GM_info.script.localizedName : GM_info.script.name) : "EhTagBuilder"; //本程序的名称
var scriptVersion = typeof(GM_info)!="undefined" ? GM_info.script.version : "本地Debug版"; //本程序的版本
var optionVersion = 1; //当前设置版本，用于提醒是否需要重置设置
var wikiVersion = 2; //当前Wiki版本，用于提醒是否需要更新脚本
var downOverCheckHook; //检测下载是否完成的循环函数
var rowsCount = 0; //行名总数
var rowsCurrent = 0; //当前下载行名


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
		for (var ki = 0,len= localStorage.length; ki <len; ki++)
		{
			keys.push(localStorage.key(ki));
		}
		return keys;
	}
}




var ds = [];
var rowObj = function(){
	var obj = {
		name:"",
		cname:"",
		info:"",
		tags:[],
		addTagFromName: function(rowObj)
		{
			if (rowObj == undefined) rowObj = this;
			GM_xmlhttpRequest({
				method: "GET",
				url: wiki_URL + (rowObj.name.length?"/"+rowObj.name:""),
				onload: function(response) {
					var page_get_w = document.getElementById("ETB_page-get");
					if (page_get_w)
					{
						var statetxt = page_get_w.getElementsByClassName("page-get-" + rowObj.name)[0];
						statetxt.classList.add("page-load");
						statetxt.innerHTML = "获取成功";
					}
					console.debug("正在处理 %s %s 页面",rowObj.name,rowObj.cname);
					dealTags(response.responseText,rowObj.tags);
				}
			});
		},
	}
	return obj;
}
var tagObj = function(){
	var obj = {
		type:0,
		name:"",
		cname:"",
		info:"",
	}
	return obj;
}


//处理行的页面
function dealRows(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");
	
	var page_get_w = document.getElementById("ETB_page-get");
	if (page_get_w)
	{
		var statetxt = page_get_w.getElementsByClassName("page-get-rows")[0];
		statetxt.classList.add("page-load");
		statetxt.innerHTML = "获取成功";
	}
				
	var wiki_body = PageDOM.getElementById("wiki-body").getElementsByTagName("div")[0];
	var linksn = wiki_body.getElementsByTagName("a");
	for (var ai=0, len=linksn.length; ai<len; ai++)
	{
		if (linksn[ai].getAttribute("href") == "ETB_wiki-version")
		{
			var new_wiki_version = Number(linksn[ai].textContent.replace(/\D/ig,""));
			if (new_wiki_version > wikiVersion)
			{
				alert("Wiki数据库结构已更新，你的 " + scriptName + " 版本可能已经不适用新的数据库，请更新你的脚本。");
			}
			break;
		}
	}
	
	var table = wiki_body.getElementsByTagName("table")[0].tBodies[0];
	rowsCount = table.rows.length;
	for(var ri=0, len=table.rows.length; ri<table.rows.length; ri++)
	{
		var trow = table.rows[ri];
		var row = new rowObj;
		row.name = trow.cells[0].textContent;
		row.cname = trow.cells[1].textContent;
		row.info = trow.cells[2];
		row.addTagFromName();
		dataset.push(row);
		
		if (page_get_w)
		{
			page_get_w.getElementsByClassName("select-menu-list")[0].appendChild(
				buildMenuItem((function()    
					{
						var div = document.createElement("div");
						var span1 = document.createElement("span");
						span1.className = "page-title"; 
						span1.innerHTML = row.cname ; 
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

//获取介绍是图片还是文字
function getInfoString(dom, creatImage)
{
	if (creatImage == undefined) creatImage = true;
	var info = [];
	if (dom.childNodes != undefined)
	{
		for (var ci=0, len=dom.childNodes.length; ci<len; ci++)
		{
			var node = dom.childNodes[ci];
			info = info.concat(getDomInfoString(node, creatImage))
		}
	}
	
	function getDomInfoString(node,creatImage)
	{
		var info = [];
		switch (node.nodeName) {
			case "BR":
				info.push(
					 "\""
					,"\\A"
					,"\""
				);
				break;
			case "IMG":
				if (creatImage)
				{
					var osrc = node.getAttribute("data-canonical-src");
					if (osrc)
					{
						if (osrc.indexOf("?")>0) //动态链接
						{
							var osrct = osrc.substring(0,osrc.indexOf("?")); //获取
							if(osrct.substr(osrct.length-1,1)=="h")
							{
								osrc = osrc.substring(0,osrc.indexOf("?")-1) + osrc.substring(osrc.indexOf("?"));
							}
						}else //静态链接
						{
							if(osrc.substr(osrc.length-1,1)=="h")
							{
								osrc = osrc.substring(0,osrc.length-1);
							}
						}
						info.push(
							"url(\""
							,osrc
							,"\")"
						);
					}else if(node.title) //链接写在title
					{
						info.push(
							"url(\""
							,node.title
							,"\")"
						);
					}
				}
				break;
			case "#text":
			default:
				if ((ci==0 || ci==(dom.childNodes.length-1) || dom.childNodes.length < 2) && node.textContent == "\n")
					break;
				info.push(
					"\""
					,specialCharToCss(node.textContent)
					,"\""
				);
				break;
		}
		return info;
	}
	return info.join("");
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

//处理Tag页面
function dealTags(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");
	
	var wiki_body = PageDOM.getElementById("wiki-body").getElementsByTagName("div")[0];
	var table = wiki_body.getElementsByTagName("table")[0].tBodies[0];
	
	for(var ri=0, len=table.rows.length; ri<len; ri++)
	{
		var trow = table.rows[ri];
		var tag = new tagObj;
		if (trow.cells.length > 2)
		{//没有足够单元格的跳过
			tag.name = trow.cells[0].textContent;
			tag.cname = trow.cells[1];
			tag.info = trow.cells[2];
			tag.type = tag.name.replace(/\s/ig,"").length < 1 ? 1 : 0;
			if (tag.type == 1 && getInfoString(tag.cname,true).replace(/\s/ig,"").length < 1)
			{
				console.error("发现无中文名的错误行%d %s",ri,tag.name);
			}
			dataset.push(tag);
		}
		else
		{
			console.error("发现无3单元格的错误行%d %s",ri,tag.name);
		}
	}
	rowsCurrent++;
}

//点击开始任务按钮
function startProgram(dataset){
	var downOver = startProgramCheck(dataset);
	if (downOverCheckHook == undefined || !downOver)
	{
		GM_xmlhttpRequest({
			method: "GET",
			url: wiki_URL + (rows_title.length?"/"+rows_title:""),
			onload: function(response) {
				dealRows(response.responseText,dataset);
			}
		});
		downOverCheckHook = setInterval(function () { startProgramCheck(dataset) }, 200);
	}
	if (!downOver)
	{
		var page_get_w = document.getElementById("ETB_page-get");
		if (!page_get_w)
		{
			windowInserPlace.appendChild(buildMenuModal("window", "ETB_page-get", "数据获取进度", null, [
				buildMenuList([
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
					)
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
}
//检测下载完成情况
function startProgramCheck(dataset)
{
	if (rowsCount > 0 && rowsCurrent >= rowsCount)
	{
		console.debug("获取完成");
		clearInterval(downOverCheckHook);
		var css = buildCSS(dataset
			,GM_getValue("ETB_create-info","boolean")
			,GM_getValue("ETB_create-info-image","boolean")
			,GM_getValue("ETB_create-cname-image","boolean")
			);
		var downBlob = new Blob([css], {'type': 'text\/css'});
		var downurl = window.URL.createObjectURL(downBlob);
		
		var css_output_w = document.getElementById("ETB_css-output");
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
						buildMenuItem("直接下载CSS文件",null,buildSVG("download"),downurl,1)
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
			css_output_w.getElementsByClassName("ETB_css-textarea")[0].value = css;
			css_output_w.getElementsByTagName("a")[0].href = downurl;
		}
		var page_get_w = document.getElementById("ETB_page-get");
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

//开始构建CSS
function buildCSS(dataset, createInfo, createInfoImage, createCnameImage)
{
	if (createInfo == undefined) createInfo = true;
	if (createInfoImage == undefined) createInfoImage = true;
	if (createCnameImage == undefined) createCnameImage = true;
	var date = new Date();
	
	var cssAry = [];
//样式信息说明
	cssAry.push(
 "/* EhTagTranslator 用户样式版，由 " + scriptName + " v" + scriptVersion + " 构建"
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
,"    url-prefix('http://exhentai.org/g/'),"
,"    url-prefix('http://g.e-hentai.org/g/')"
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
,"    url-prefix('http://g.e-hentai.org/g/')"
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
,"    url-prefix('http://exhentai.org/g/')"
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
,"    url-prefix('http://exhentai.org/g/'),"
,"    url-prefix('http://g.e-hentai.org/g/')"
,"{"
//▲CSS内容部分
	);
	for (var ri=0, len=dataset.length; ri<len; ri++)
	{
		var row = dataset[ri];
//添加行名的注释
		cssAry.push(""
,"/* " + row.name
," * " + row.cname
," */"
		);
		for (var ti = 0,len= row.tags.length; ti <len; ti++)
		{
			var tag = row.tags[ti];
			if (tag.type == 0)
			{
				var tagid = (row.name=="misc"?"":row.name + ":") + tag.name.replace(/\s/ig,"_");
				cssAry.push(""
//▼CSS内容部分
,"  a[id=\"ta_" + tagid + "\"]{"
,"    font-size:0px;"
,"  }"
,"  a[id=\"ta_" + tagid + "\"]::before{"
,"    content:" + getInfoString(tag.cname, createCnameImage) + ";"
,"  }"
//▲CSS内容部分
				);
				if (createInfo)
				{
					var sinfo = getInfoString(tag.info, createInfoImage);
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
 "/* " + getInfoString(tag.cname, false)
," * " + getInfoString(tag.info, false)
," */"
				);
			}
			
		}
	}
	
	cssAry.push(
//▼CSS内容部分
 "}"
//▲CSS内容部分
	);
	
	var css = cssAry.join("\r\n");
	return css;
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
	select_menu.appendChild(button);
	var span = document.createElement("span");
	span.className = "js-select-button";
	if (icon != undefined)
		span.appendChild(icon);
	span.innerHTML += title;
	button.appendChild(span);
	select_menu.appendChild(modal);
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

	switch (mode) {
		case "window":
			modal_holder.style.display = "block";
			CloseSvg.onclick = function(){
				modal_holder.style.display = "none";
			}
			break;

		case "menu":		
		default:
			break;
	}
	
	var title = document.createElement("span");
	title.className = "select-menu-title";
	title.innerHTML = stitle;
	header.appendChild(title);

	if (lists != undefined)
	{
		for(var li = 0,len= lists.length; li <len; li++)
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
		for(var ii = 0,len= items.length; ii <len; ii++)
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
			innerHTML = '<img width="16" height="16" class="octicon octicon-question select-menu-item-icon" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAADCUlEQVR42l3RYWjUdRzH8ffv97//7fTaOL2c6+66rNi52Q3Uyors5sYokh50I+iBGVFtoqGI+SQIKoiKkGCxedbOFqGWIJqFSiRoNKOU3DVpixZZc9PVJnO33f2v2/1/3x5s3arPw++DFx8+XyUiVFTYsiToQwGgUMpC40Epi3zeQf81y2JLg9aIVqA0f07nKBSLygMQXbGUziNPoBRo5aHSDuMp1XD1skPPB4cpnf+RrbURVtwaxgouQy+9mcffPwCAB8CyLKqX1IACZWw+O9xP/3e9xGrjrF3TzEztOvb29cGFQbY94GP18lvQSi0AGpubvGFKsy7vvPk5T7bu4OVdzWit+SciwtjYGK/v3M5qKZ/nAeWh0hvlwMcneLhpEy0tLWSzWbq7uxkaGiIQCJBMJqmrq8OyLED+Cyhl4/dGOfPlJfZ27QTg3De9nDr9IZFQDd9+MsDAFyepuDNGpTMDYsqIByA7NU3Pe58yMnyNXC4HQNOGZkZGdpDpu0hVZIZVqkSDVWBZOIhBl0toACef48LZk4QCXg4dOogxBp/PR9vzbXR1pTj2VS/JPZ0cmzHcEAGvF+ZHRESovyMsv57ukJ9O7ZGGWFTS6bSUSiX5f0ZHR+WppofkSufbEo9GRETmGogRZnN5/rg2wZpYlFTnLhKJOC9sa2ffvhTj4+MAhEIhIivrsW27XGAOEEMp5/BSx1Hyvhpui8LB1M+8+FwP35/bzdObN2OMAWB0appnUvu5Ojm1MKIYwRSKuAbS6TSZTIaO/R8xOXGJQrGKtvZ2lFI4jsPwxA3u3rSdH959YwEAMMYFBNd1SSQSNDY24rouSim01jiOwyuvvkZs/SPc0/woR9Md/wYEZVlseew+khtbWHv/elbdFae6ejnGGAYGB/n6/EXWtT7LhoYGqjym/MY5QGksv58H743Tf+U6ppghvnKW4eEsx4//Qtaqp3X3Wyxa5KXSI/i0IPOCEhEW+7xye7gagMlsDm0rgkE/CmHiep6i68UfCKKVoJVCI/z+22UKjqP+BndsSOE7UsTgAAAAAElFTkSuQmCC"/>';
			break;

		case "js":
			innerHTML = '<img width="16" height="16" class="octicon octicon-question select-menu-item-icon" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALHRFWHRDcmVhdGlvbiBUaW1lAFN1biAzMCBNYXIgMjAwOCAxNzoyMjo0NyAtMDUwMNSe+EoAAAAHdElNRQfYBAYRMSwLM2/oAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGPC/xhBQAAAtBJREFUeNpdU11IU3EU/93tTje1vJujzS1xZVNnhdeMStG8ha/VDYKUICYk9RLYW1FBIERv0atFTSgqCllPvRiaDyp9qFPLsTQ12nB96Fzuy3117nVL24HD/3DO+f3u/57z+zNWqxWJRAKpVEr2ZDIpe9Yu2fy1dAhzyxCW1sBPhQy7sjW/3w82GAwi1whUTkcXufgrDMvsMhBLyKVbub0swzD/JS5WL93NgCEBvRn+YjVg1UHQ/PDbIwnw7qhxVSbIAY/TwXMlWrgXV8AqgAodwKk36vMBCAQWsmDJmJtHcQoM7NI9bHV7RdHeBnVBISZGPsL56AnEjnPgG+oRDYfgdDzDzPgnZ1pCpuHoHsIrNqXSOHbX2LhvU2OQwYXbAEUe+OYWcDtMsFRZqTlJeZbq7XBP3BDL9x/A188zAhDRskarjdOXlkIRq6CmIgLnw/H+HbDOwt4iwDH6Vp6gvemwTG6prICO+sNxcHgzBgVUGoRWAzCWmemHVESgQu/IPK70vACUGvQOeyjuo1qeXJP64rEoJJxkikmXe0EKOD1Ni6GpMSwGXw8isBgggoLNWKGkmpL6SmRgFqc0qCIBZeineLazHWyeRv6KRVcKsakJfE0lLJweYmM9+KoymkUceoMWz3sew/P9Txet2cUe2gknp9VArVHj3sN+HG+shf1EszwLJCOwn6Q4uY7paQ8Ghidx+XwjVKkoXGFTL+Db0EHg9wqtKQyxdR+6b/ch4V2BdXsR9LTbVdrZbDAEhZnDteun5XVuNcZkMqGz0jfANxwUxI62zLAkl7gV8sKRJh2n4uQx0sZT0siHwfse0zGfz/dPiV2UdNJNLEdam1FdR+8nLZWYDEES7nEXRvuHsOCZW8hKXb6B2WyWgwtWb7F/DVdJtmfyWezJfTQkhdlAFC8NRbjz4ItZlrLX690kyBolLXQYydVb0rR4LFHvQk4v/gIj/RRmaCXZ1wAAAABJRU5ErkJggg=="/>';
			break;

		case "eh":
			innerHTML = '<img width="16" height="16" class="octicon" aria-hidden="true" src="data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wARBmb/EQZm/xEGZv8RBmb/EQZm/////wD///8A////ABEGZv8RBmb/////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv8RBmb/EQZm/xEGZv////8A////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/////AP///wD///8A////AP///wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/////AP///wARBmb/EQZm/////wD///8A////AP///wD///8A////ABEGZv8RBmb/////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv////8A////AP///wD///8A////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/EQZm/xEGZv////8AEQZm/xEGZv////8AEQZm/xEGZv8RBmb/EQZm/xEGZv8RBmb/////AP///wARBmb/EQZm/xEGZv8RBmb/////ABEGZv8RBmb/////ABEGZv8RBmb/EQZm/xEGZv8RBmb/EQZm/////wD///8AEQZm/xEGZv////8A////AP///wD///8A////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/////AP///wD///8A////AP///wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/////AP///wARBmb/EQZm/////wD///8A////AP///wD///8A////ABEGZv8RBmb/////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv8RBmb/EQZm/xEGZv////8A////AP///wARBmb/EQZm/////wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/EQZm/xEGZv8RBmb/////AP///wD///8AEQZm/xEGZv////8A////ABEGZv8RBmb/////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8AAP//AACDmQAAg5kAAJ+ZAACfmQAAn5kAAISBAACEgQAAn5kAAJ+ZAACfmQAAg5kAAIOZAAD//wAA//8AAA=="/>';
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
	
	return CloseSvg;
}
//打开设置窗口
function startOption()
{
	var option_modal_w = document.getElementById("ETB_option");
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
						buildMenuItem("生成简介图片","生成简介中的图片。",
							(function(){
								var chk = document.createElement("input");
								chk.type = "checkbox";
								chk.id = "ETB_create-info-image";
								chk.name = chk.id;
								chk.className = "octicon octicon-question select-menu-item-icon " + chk.id;
								return chk;
							})()
							,"ETB_create-info-image",3),
						buildMenuItem("生成中文名图片","生成中文名中的图片，一般为名称前的小图标。",
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
	for (var ci = 0,len= dom.childNodes.length; ci <len; ci++)
	{
		visitChildNodes(dom.childNodes[ci], callback);
	}
}
//保存设置
function saveOption()
{
	var option_modal_w = document.getElementById("ETB_option");
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
	var option_modal_w = document.getElementById("ETB_option");
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
	alert(scriptName + " 本次程序版本更新改变了设置结构，建议先重置设置否则可能会导致无法正常使用。");
	resetOption(true);
}

var menu_modal = buildMenuModal("menu", null, "请选择任务 v" + scriptVersion, null, [
		buildMenuList([
			buildMenuItem("生成CSS","生成用户样式版EhTagTranslator，请使用Stylish扩展安装。理论上安卓火狐也可使用。",buildSVG("css"),function(){
					startProgram(ds);
				}
			,0),
			/*buildMenuItem("生成JSON","生成用户脚本版EhTagTranslator数据库，功能暂未开发。",buildSVG("js"),function(){
					alert("设想中功能，暂未开发，仅占位");
				}
			,0)*/
		]),
		buildMenuList([
			buildMenuItem("设置选项",null,buildSVG("Settings"),function(){startOption();reloadOption();},1),
			buildMenuItem("查看使用帮助",null,buildSVG("question"),"https://github.com/Mapaler/EhTagTranslator/blob/master/README.md",1),
			buildMenuItem("贡献翻译",null,buildSVG("book"),"https://github.com/Mapaler/EhTagTranslator/wiki",1),
		])
	]);
	
buttonInserPlace.insertBefore(buildButton(" " + scriptName + " ", buildSVG("eh"), menu_modal),buttonInserPlace.getElementsByTagName("li")[0]);
})();