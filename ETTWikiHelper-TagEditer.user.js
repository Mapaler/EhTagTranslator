// ==UserScript==
// @name        ETTWikiHelper-TagEditer
// @name:zh-CN	E绅士标签翻译辅助工具-标签编辑
// @namespace   http://www.mapaler.com/
// @description Help to edit the gallery's tags.
// @description:zh-CN	辅助编辑画廊的标签
// @include     /^https?://(exhentai\.org|e-hentai\.org)/g/\d+/\w+/.*$/
// @version     0.0.1
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

.ewh-float { /*浮动窗体*/
	position: fixed;
	top: 100px;
	left: 100px;
	background-color : inherit;
	margin: 0 !important;
	padding: 0 !important;
	border: ridge 3px #eee !important;
	opacity: 0.8;
}
.ewh-bar-floatcaption { /*标题栏*/
	height: 20px;
	padding: 2px;
	background-image: linear-gradient(to right,#808080,#B7B5BB);
}
.ewh-float .ewh-bar-floatcaption { /*浮动时的标题颜色*/
	background-image: linear-gradient(to right,#000280,#0F80CD);
}
.ewh-windowcaption { /*标题文字*/
	pointer-events:none;
	user-select: none;
	margin-top:2px;
	float: left;
	color: white;
	line-height: 14px;
	font-size: 14px;
}
.ewh-caption-btn { /*平时的按钮*/
	padding: 0;
	font-size: 14px;
	margin-top:1px;
	margin-left:2px;
	height: 18px;
	width: 22px;
	float: right;
	background-color: #c0c0c0;
	border-style: outset;
	border-width: 2px;
	border-color: white black black white;
}
.ewh-caption-btn:active { /*按下时的凹陷*/
	background-color: #d8d8d8;
	padding-left: 1px !important;
	padding-top: 1px !important;
	border-style: inset;
	border-color:  black white white black;
}
.ewh-caption-btn:focus { /*激活后的虚线*/
	outline: dotted 1px black;
}
.ewh-btn-floatwindow::before{ /*开启浮动按钮的内容*/
	content: "open_in_new";
}
.ewh-float .ewh-btn-floatwindow::before{
	content: "close";
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

//限定数值最大最小值
function limitMaxAndMin(num,max,min)
{
	if (num>max) return max;
	else if (num< min) return min;
	else return num;
}
//添加窗体鼠标拖拽移动
var windowPosition = ewhWindow.position = [0, 0]; //[X,Y] 用以储存窗体开始拖动时的鼠标相对窗口坐标差值。
divCaptionBar.addEventListener("mousedown", function(e) { //按下鼠标则添加移动事件
	var eX = limitMaxAndMin(e.pageX,document.documentElement.clientWidth,0), eY = limitMaxAndMin(e.pageY,document.documentElement.clientHeight,0); //不允许鼠标超出网页。
	windowPosition[0] = eX - ewhWindow.offsetLeft;
	windowPosition[1] = eY - ewhWindow.offsetTop;
	var handler_mousemove = function(e) { //移动鼠标则修改窗体坐标
		var eX = limitMaxAndMin(e.pageX,document.documentElement.clientWidth,0), eY = limitMaxAndMin(e.pageY,document.documentElement.clientHeight,0); //不允许鼠标超出网页。
		ewhWindow.style.left = (eX - windowPosition[0]) + 'px';
		ewhWindow.style.top = (eY - windowPosition[1]) + 'px';
	};
	var handler_mouseup = function(e) { //抬起鼠标则取消移动事件
		document.removeEventListener("mousemove", handler_mousemove);
	};
	document.addEventListener("mousemove", handler_mousemove);
	document.addEventListener("mouseup", handler_mouseup, { once: true });
});

//生成切换浮动状态的按钮
var spnCaption = divCaptionBar.appendChild(document.createElement("div"));
spnCaption.className = "ewh-windowcaption";
var captionIcon = spnCaption.appendChild(document.createElement("span"));
captionIcon.className = "icons";
captionIcon.appendChild(document.createTextNode("🏷️"));
spnCaption.appendChild(document.createTextNode(scriptName));

//生成切换浮动状态的按钮
var btnFloat = divCaptionBar.appendChild(document.createElement("button"));
btnFloat.className = "ewh-caption-btn material-icons ewh-btn-floatwindow";
btnFloat.appendChild(document.createElement("span"));
btnFloat.onclick = function(){
	ewhWindow.classList.toggle("ewh-float");
}

//生成修改设置的按钮
var btnConfig = divCaptionBar.appendChild(document.createElement("button"));
btnConfig.className = "ewh-caption-btn material-icons ewh-btn-floatconfig";
btnConfig.appendChild(document.createElement("span").appendChild(document.createTextNode("settings")));