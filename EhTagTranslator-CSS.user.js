// ==UserScript==
// @name        EhTagTranslator-CSS
// @namespace   http://www.mapaler.com/
// @description Translate E-Hentai tags to Chinese.
// @include     *://github.com/Mapaler/EhTagTranslator*
// @version     1.0.0
// @grant       none
// @copyright	2016+, Mapaler <mapaler@163.com>
// ==/UserScript==

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
  url: "http://localhost/",
  headers: {
    //"User-Agent": "Mozilla/5.0",    // If not specified, navigator.userAgent will be used.
    //"Accept": "text/xml"            // If not specified, browser defaults will be used.
  },
  onload: function(response) {
    //var tmp = response.response.getElementById("notSupInfo").getElementsByTagName("a")[0];

    //var repDOM = new DOMParser()
    //    .parseFromString(response.responseText, "text/html");
    //var tmp = repDOM.getElementById("notSupInfo").getElementsByTagName("a")[0];
    console.log(response);
  }
});
