// ==UserScript==
// @name        ETTWikiHelper-TagEditer
// @name:zh-CN	E绅士标签翻译辅助工具-标签编辑
// @namespace   http://www.mapaler.com/
// @description Help to edit the gallery's tags.
// @description:zh-CN	辅助编辑画廊的标签
// @include     /^https?://(exhentai\.org|e-hentai\.org)/g/\d+/\w+/.*$/
// @version     1.0.0
// @author      Mapaler <mapaler@163.com>
// @copyright	2019+, Mapaler <mapaler@163.com>
// ==/UserScript==

var lang = (navigator.language||navigator.userLanguage).replace("-","_"); //获取浏览器语言
var scriptVersion = "LocalDebug"; //本程序的版本
var scriptName = "ETTWikiHelper-TagEditer"; //本程序的名称
if (typeof(GM_info)!="undefined")
{
	scriptVersion = GM_info.script.version.replace(/(^\s*)|(\s*$)/g, "");
	scriptName = GM_info.script.localizedName || GM_info.script.name_i18n[lang] || GM_info.script.name;
}

//限定数值最大最小值
function limitMaxAndMin(num,max,min)
{
	if (num>max) return max;
	else if (num< min) return min;
	else return num;
}

//默认CSS内容
var ewh_tag_styleText_Default = `
/* fallback */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -moz-font-feature-settings: 'liga';
  -moz-osx-font-smoothing: grayscale;
}

#gd4.ewh-float { /*浮动窗体*/
	position: fixed;
	top: 100px;
	left: 100px;
	background-color : inherit;
	margin: 0 !important;
	padding: 0 !important;
	border-style: ridge;
	border-width: 3px;
	border-color: #eee black black #eee;
	opacity: 0.8;
}
.ewh-bar-floatcaption { /*标题栏整体（本程序整体）*/
	height: 22px;
	position: relative;
}
.ewh-cpttext-box { /*标题栏文字框*/
	width: 100%;
	height: 100%;
	float: left;
	color: white;
	line-height: 22px;
	font-size: 14px;
	background-image: linear-gradient(to right,#808080,#B7B5BB);
}
.ewh-float .ewh-cpttext-box  { /*浮动时的标题颜色*/
	background-image: linear-gradient(to right,#000280,#0F80CD);
}
.ewh-cpttext-box::before{ /*标题图标*/
	content: "🏷️";
}
.ewh-cpttext-box span { /*标题文字*/
	pointer-events:none;
	user-select: none;
}
.ewh-cptbtn-box { /*标题按钮框*/
	height: 100%;
	position: absolute;
	top: 0;
	right: 8px;
	line-height: 22px;
}
.ewh-cpt-btn { /*平时的按钮*/
	vertical-align: middle;
	padding: 0;
	font-size: 14px;
	margin-top:0;
	margin-left:2px;
	height: 18px;
	width: 22px;
	background-color: #c0c0c0;
	border-style: outset;
	border-width: 2px;
	border-color: white black black white;
}
.ewh-cpt-rag { /*平时的范围拖动条*/
	vertical-align: middle;
	padding: 0;
	font-size: 14px;
	margin-top:0;
	margin-left:2px;
	height: 18px;
	width: 100px;
}
.ewh-cpt-btn:active { /*按下时的凹陷*/
	background-color: #d8d8d8;
	padding-left: 1px !important;
	padding-top: 1px !important;
	border-style: inset;
	border-color:  black white white black;
}
.ewh-cpt-btn:focus { /*激活后的虚线*/
	outline: dotted 1px black;
}
.ewh-btn-closefloat,.ewh-rag-opacity { /*平时隐藏关闭浮动的按钮*/
	display: none;
}
.ewh-float .ewh-btn-closefloat,.ewh-float .ewh-rag-opacity { /*浮动时显示关闭浮动的按钮*/
	display: unset;
}
.ewh-float .ewh-btn-openfloat{ /*浮动时隐藏开启浮动的按钮*/
	display: none;
}
`;
//获取Tag编辑区
var ewhWindow = document.querySelector("#gd4");
//增加浮动窗标题栏
var divCaptionBar = ewhWindow.insertBefore(document.createElement("div"),gd4.firstChild);
divCaptionBar.className = "ewh-bar-floatcaption";

//生成辅助器CSS
var ewh_tag_style = divCaptionBar.appendChild(document.createElement("style"));
ewh_tag_style.type = "text/css";
ewh_tag_style.appendChild(document.createTextNode(ewh_tag_styleText_Default));

//生成标题栏文字
var divCaption = divCaptionBar.appendChild(document.createElement("div"));
divCaption.className = "ewh-cpttext-box";
divCaption.appendChild(document.createElement("span")).appendChild(document.createTextNode(scriptName));

//添加窗体鼠标拖拽移动
var windowPosition = ewhWindow.position = [0, 0]; //[X,Y] 用以储存窗体开始拖动时的鼠标相对窗口坐标差值。
divCaption.addEventListener("mousedown", function(e) { //按下鼠标则添加移动事件
	var eX = limitMaxAndMin(e.pageX,document.documentElement.clientWidth + document.documentElement.scrollLeft,document.documentElement.scrollLeft), eY = limitMaxAndMin(e.pageY,document.documentElement.clientHeight + document.documentElement.scrollTop,document.documentElement.scrollTop); //不允许鼠标超出网页。
	windowPosition[0] = eX - ewhWindow.offsetLeft;
	windowPosition[1] = eY - ewhWindow.offsetTop;
	var handler_mousemove = function(e) { //移动鼠标则修改窗体坐标
		var eX = limitMaxAndMin(e.pageX,document.documentElement.clientWidth + document.documentElement.scrollLeft,document.documentElement.scrollLeft), eY = limitMaxAndMin(e.pageY,document.documentElement.clientHeight + document.documentElement.scrollTop,document.documentElement.scrollTop); //不允许鼠标超出网页。
		ewhWindow.style.left = (eX - windowPosition[0]) + 'px';
		ewhWindow.style.top = (eY - windowPosition[1]) + 'px';
	};
	var handler_mouseup = function(e) { //抬起鼠标则取消移动事件
		document.removeEventListener("mousemove", handler_mousemove);
	};
	document.addEventListener("mousemove", handler_mousemove);
	document.addEventListener("mouseup", handler_mouseup, { once: true });
});

//生成标题栏按钮
var divButtonBox = divCaptionBar.appendChild(document.createElement("div"));
divButtonBox.className = "ewh-cptbtn-box";

//生成修改设置的按钮
var ragOpacity = divButtonBox.appendChild(document.createElement("input"));
ragOpacity.className = "ewh-cpt-rag ewh-rag-opacity";
ragOpacity.type = "range";
ragOpacity.max = 1;
ragOpacity.min = 0.5;
ragOpacity.step = 0.01;
ragOpacity.value = 0.8;
ragOpacity.title = "窗体不透明度";
ragOpacity.onchange = ragOpacity.oninput = function(){
	ewhWindow.style.opacity = this.value;
};

//生成打开浮动状态的按钮
var btnOpenFloat = divButtonBox.appendChild(document.createElement("button"));
btnOpenFloat.className = "ewh-cpt-btn material-icons ewh-btn-openfloat";
btnOpenFloat.title = "浮动标签编辑框";
btnOpenFloat.appendChild(document.createElement("span").appendChild(document.createTextNode("open_in_new")));
btnOpenFloat.onclick = function(){
	ewhWindow.setAttribute("style",ewhWindow.getAttribute("style_bak"));
	ewhWindow.removeAttribute("style_bak");
	ewhWindow.classList.add("ewh-float");
};

//生成关闭浮动状态的按钮
var btnCloseFloat = divButtonBox.appendChild(document.createElement("button"));
btnCloseFloat.className = "ewh-cpt-btn material-icons ewh-btn-closefloat";
btnCloseFloat.title = "关闭浮动窗体";
btnCloseFloat.appendChild(document.createElement("span").appendChild(document.createTextNode("close")));
btnCloseFloat.onclick = function(){
	ewhWindow.setAttribute("style_bak",ewhWindow.getAttribute("style"));
	ewhWindow.removeAttribute("style");
	ewhWindow.classList.remove("ewh-float");
};