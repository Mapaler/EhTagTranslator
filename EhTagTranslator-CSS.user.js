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
		console.log(css);
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