// ==UserScript==
// @name        EhTagBuilder
// @name:zh-CN	E绅士标签构建者
// @namespace   http://www.mapaler.com/
// @description Build EhTagTranslater from Wiki.
// @description:zh-CN	从Wiki获取EhTagTranslater数据库，将E绅士TAG翻译为中文
// @include     *://github.com/Mapaler/EhTagTranslator*
// @icon        http://exhentai.org/favicon.ico
// @version     1.0.4
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
var downOverCheckHook; //检测下载是否完成的循环函数
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
			if (rowObj == undefined) rowObj = this;
			GM_xmlhttpRequest({
				method: "GET",
				url: wiki_URL + (rowObj.name.length?"/"+rowObj.name:""),
				onload: function(response) {
					var page_get_w = document.getElementById("page-get");
					if (page_get_w)
					{
						console.log("page-get-" + rowObj.name);
						var statetxt = page_get_w.getElementsByClassName("page-get-" + rowObj.name)[0];
						statetxt.style.color = "#0A0";
						statetxt.innerHTML = "获取成功";
					}
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

//处理行的页面
function dealRows(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");
	
	var page_get_w = document.getElementById("page-get");
	if (page_get_w)
	{
		var statetxt = page_get_w.getElementsByClassName("page-get-rows")[0];
		statetxt.style.color = "#0A0";
		statetxt.innerHTML = "获取成功";
	}
				
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
		
		if (page_get_w)
		{
			page_get_w.getElementsByClassName("select-menu-list")[0].appendChild(
				buildMenuItem((function()    
					{
						var div = document.createElement("div");
						var span1 = document.createElement("span");
						span1.style.fontWeight = "bold";
						span1.innerHTML = row.cname + " "; 
						div.appendChild(span1);
						var span2 = document.createElement("span");
						span2.className = "page-get-" + row.name;
						span2.innerHTML = "等待"; 
						div.appendChild(span2);
						return div;
					})()
					,null,null,null,null,true)
			);
		}
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
		if (trow.cells.length > 2 && trow.cells[0].textContent.replace(/\s/ig,"").length > 0)
		{//没有足够单元格，或没英文原名的跳过
			tag.name = trow.cells[0].textContent;
			tag.cname = trow.cells[1].textContent;
			tag.info = getTrueImgUrlInfo(trow.cells[2]);
			dataset.push(tag);
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
		if (!document.getElementById("page-get"))
		{
			windowInserPlace.appendChild(buildMenuModal("window", "page-get", "数据获取进度", null, [
				buildMenuList([
					buildMenuItem((function()    
						{
							var div = document.createElement("div");
							var span1 = document.createElement("span");
							span1.style.fontWeight = "bold";
							span1.innerHTML = "列表页面 "; 
							div.appendChild(span1);
							var span2 = document.createElement("span");
							span2.className = "page-get-rows";
							span2.innerHTML = "等待"; 
							div.appendChild(span2);
							return div;
						})()
						,null,null,null,null,true)
				])
			]
			));
		}
		else
		{
			document.getElementById("page-get").style.display = "block";
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
		var css = startCSSBuild(dataset);
		var downBlob = new Blob([css], {'type': 'text\/css'});
		var downurl = window.URL.createObjectURL(downBlob);
		
		if (!document.getElementById("css-output"))
		{
			windowInserPlace.appendChild(buildMenuModal("window", "css-output", "用户样式版EhTagTranslator", null,
				[
					buildMenuList([
						buildMenuItem("CSS文本",
							(function()    
							{
								var textarea = document.createElement("textarea");
								textarea.className = "txta";
								textarea.value = css;
								textarea.wrap = "off";
								return textarea;
							})()
							,buildSVG("css"),null,null,true),
						buildMenuItem("直接下载CSS文件",null,buildSVG("download"),null,downurl,true)
					])
				],
				[
					".css-output .txta" + "{\r\n" + [
						'width:260px',
						'max-width:260px',
						'min-width:260px',
						'height:150px',
					].join(';\r\n') + "\r\n}",
				].join('\r\n')
			));
		}
		else
		{
			document.getElementById("css-output").style.display = "block";
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
function startCSSBuild(dataset)
{
	var date = new Date();
	
	var cssAry = [];
	cssAry.push(
 "/* 本CSS由 " + scriptName + " v" + scriptVersion + " 构建"
," * 构建时间为"
," * " + date.toString()
," */"
	);
	cssAry.push(
//▼CSS内容部分
 "@namespace url(http://www.w3.org/1999/xhtml);"
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
	);
	
	for (var ri = 0; ri < dataset.length; ri++)
	{
		var row = dataset[ri];
		for (var ti = 0; ti < row.tags.length; ti++)
		{
			var tag = row.tags[ti];
			cssAry.push(""
//▼CSS内容部分
,"  a[id^=\"ta_" + (row.name=="misc"?"":row.name + ":") + tag.name.replace(" ","_") + "\"]{"
,"    font-size:0px;"
,"  }"
,"  a[id^=\"ta_" + (row.name=="misc"?"":row.name + ":") + tag.name.replace(" ","_") + "\"]:before{"
,"    content:\"" + tag.cname + "\";"
,"  }"
//▲CSS内容部分
			);
			if (tag.info.content.length > 0)
			{
				cssAry.push(""
//▼CSS内容部分
,"  a[id^=\"ta_" + (row.name=="misc"?"":row.name + ":") + tag.name.replace(" ","_") + "\"]:hover:after,a[id^=\"ta_" + (row.name=="misc"?"":row.name + ":") + tag.name.replace(" ","_") + "\"]:focus:after{"
,"    content:" + (tag.info.type?"url(" + tag.info.content + ")":"\"" + tag.info.content +　"\"") + ";"
,"  }"
//▲CSS内容部分
				);
			}
			
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
		for(var li = 0; li < lists.length; li++)
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
		for(var ii = 0; ii < items.length; ii++)
		{
			var item = items[ii];
			if (item)
				list.appendChild(item);
		}
	}
	return list;
}

//构建一个菜单列表项
function buildMenuItem(heading, description, icon, callback, href, setting)
{
	if (heading == undefined) heading = "未设定";
	if (!href)
	{
		var item = document.createElement("div");
		if (callback != undefined) item.onclick = callback;
	}
	else
	{
		var item = document.createElement("a");
		item.target = "_blank";
		item.href = href;
	}
	if (!setting)
	{
		item.className = "select-menu-item js-navigation-item";
	}
	else
	{
		item.className = "select-menu-item select-menu-action";
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

var menu_modal = buildMenuModal("menu", null, "请选择任务", null, [
		buildMenuList([
			buildMenuItem("生成CSS","生成用户样式版EhTagTranslator，显示速度快，但功能有限。请使用Stylish扩展安装。",buildSVG("css"),function(){
					startProgram(ds);
				}
			),
			/*buildMenuItem("生成JSON","生成用户脚本版EhTagTranslator数据库，功能暂未开发。",buildSVG("js"),function(){
					alert("设想中功能，暂未开发，仅占位");
				}
			)*/
		]),
		buildMenuList([
			/*buildMenuItem("设置选项",null,buildSVG("Settings"),function(){alert("暂未开发，欢迎提供需求思路。")},null,true),*/
			buildMenuItem("查看EhTagBuilder使用帮助",null,buildSVG("question"),null,"https://github.com/Mapaler/EhTagTranslator/blob/master/README.md",true),
			buildMenuItem("编辑翻译数据库",null,buildSVG("book"),null,"https://github.com/Mapaler/EhTagTranslator/wiki",true),
		])
	]);
	
buttonInserPlace.insertBefore(buildButton(" EhTagBuilder ", buildSVG("eh"), menu_modal),buttonInserPlace.getElementsByTagName("li")[0]);
})();