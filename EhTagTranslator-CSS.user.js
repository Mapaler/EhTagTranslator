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
				url: wiki_URL + "/" + this.name,
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
	url: wiki_URL + "/rows",
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
		startCSSBuild(dataset);
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
	console.log(dataset);
}