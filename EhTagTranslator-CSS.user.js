// ==UserScript==
// @name        EhTagTranslator-CSS
// @namespace   http://www.mapaler.com/
// @description Translate E-Hentai tags to Chinese.
// @include     *://github.com/Mapaler/EhTagTranslator*
// @version     1.0.0
// @grant       none
// @copyright	2016+, Mapaler <mapaler@163.com>
// ==/UserScript==

var wiki_rows_URL="https://github.com/Mapaler/EhTagTranslator/wiki/rows"; //GitHub wiki 行名列表的地址
var ds = [];
var row = function(){
	var obj = {
		name:"",
		cname:"",
		tags:[],
	}
	return obj;
}
var tag = function(){
	var obj = {
		name:"",
		cname:"",
		indo:"",
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
	url: wiki_rows_URL,
	onload: function(response) {
		dealRows(response.responseText,ds);
	}
});

//快速模式处理多图的回调函数
function dealRows(response, dataset)
{
	var parser = new DOMParser();
	PageDOM = parser.parseFromString(response, "text/html");

	var wiki_body = document.getElementsByClassName("wiki-body")[0];
	var table = wiki_body.getElementsByTagName("table")[0].tBodies[0];
	
	for(var ri=0;ri<table.rows.length;ri++)
	{
		var row = table.rows[ri];
		console.log(row.cells[0].innerHTML);
	}
}
