// ==UserScript==
// @name        ETTWikiHelper-TagEditer
// @name:zh-CN	E绅士标签翻译辅助工具-标签编辑
// @namespace   http://www.mapaler.com/
// @description Help to edit the gallery's tags.
// @description:zh-CN	辅助编辑画廊的标签
// @include     /^https?://(exhentai\.org|e-hentai\.org)/g/\d+/\w+/.*$/
// @version     1.4.2
// @author      Mapaler <mapaler@163.com>
// @copyright	2019+, Mapaler <mapaler@163.com>
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// ==/UserScript==

var lang = (navigator.language||navigator.userLanguage).replace("-","_"); //获取浏览器语言
var scriptVersion = "unknown"; //本程序的版本
var scriptName = "ETTWikiHelper-TagEditer"; //本程序的名称
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
	top: 10%;
	left: 10%;
	background-color : inherit;
	margin: 0 !important;
	padding: 0 !important;
	border-style: ridge;
	border-width: 3px;
	border-color: #eee black black #eee;
	opacity: 0.8;
}
.ewh-bar-floatcaption { /*标题栏整体*/
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
	margin-top:-2px;
	height: 18px;
	width: 20px;
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
	height: 18px;
	width: 100px;
}
.ewh-cpt-btn:active { /*按钮按下时的凹陷*/
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
.ewh-bar-tagsearch{
	position: relative;
}
.ewh-ipt-tagsearch{
	width: 200px;
	box-sizing: border-box;
}
.ewh-tagsearchtext,.ewh-tagsearchlink{
	font-size: 10pt;
}
.ewh-bar-tagsearch a::before{
	font-size: 10pt;
	font-weight: bold;
}
.ewh-bar-tagsearch a::after{
	font-size: 10pt;
	background: #c0c0c0;
	color:black;
	border-style: ridge;
	border-width: 3px;
	border-color: #eee black black #eee;
	position:absolute;
	z-index:999;
	padding:8px;
	min-width:150px;
	max-width:500px;
	white-space:pre-wrap;
	opacity: 0;
	transition: opacity 0.1s;
	top:28px;
	left:45%;
	pointer-events:none;
	font-weight: 400;
	line-height: 20px;
}
.ewh-bar-tagsearch a:hover::after{
	opacity: 1;
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
	if (!ewhWindow.classList.contains("ewh-float")) return; //如果不是浮动窗体直接结束
	var eX = limitMaxAndMin(e.clientX,document.documentElement.clientWidth,0), eY = limitMaxAndMin(e.clientY,document.documentElement.clientHeight,0); //不允许鼠标超出网页。
	windowPosition[0] = eX - ewhWindow.offsetLeft;
	windowPosition[1] = eY - ewhWindow.offsetTop;
	var handler_mousemove = function(e) { //移动鼠标则修改窗体坐标
		var eX = limitMaxAndMin(e.clientX,document.documentElement.clientWidth,0), eY = limitMaxAndMin(e.clientY,document.documentElement.clientHeight,0); //不允许鼠标超出网页。
		ewhWindow.style.left = (eX - windowPosition[0]) + 'px';
		ewhWindow.style.top = (eY - windowPosition[1]) + 'px';
	};
	var handler_mouseup = function(e) { //抬起鼠标则取消移动事件
		document.removeEventListener("mousemove", handler_mousemove);
		if (ewhWindow.style.left) GM_setValue("floatwindow-left",ewhWindow.style.left); //储存窗体位置
		if (ewhWindow.style.top) GM_setValue("floatwindow-top",ewhWindow.style.top); //储存窗体位置

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
ragOpacity.title = "窗体不透明度";
ragOpacity.onchange = ragOpacity.oninput = function(){
	ewhWindow.style.opacity = this.value;
};
ragOpacity.onchange = function(){
	ragOpacity.oninput();
	if (ewhWindow.style.opacity) GM_setValue("floatwindow-opacity",ewhWindow.style.opacity); //储存窗体透明度
};

//生成打开浮动状态的按钮
var btnOpenFloat = divButtonBox.appendChild(document.createElement("button"));
btnOpenFloat.className = "ewh-cpt-btn material-icons ewh-btn-openfloat";
btnOpenFloat.title = "浮动标签编辑框";
btnOpenFloat.appendChild(document.createElement("span").appendChild(document.createTextNode("open_in_new")));
btnOpenFloat.onclick = function(){
	//ewhWindow.setAttribute("style",ewhWindow.getAttribute("style_bak"));
	//ewhWindow.removeAttribute("style_bak");
	ewhWindow.classList.add("ewh-float");
	ewhWindow.style.left = GM_getValue("floatwindow-left");
	ewhWindow.style.top = GM_getValue("floatwindow-top");
	ewhWindow.style.opacity = ragOpacity.value = GM_getValue("floatwindow-opacity") || 0.8;
};
GM_registerMenuCommand("打开浮动标签编辑框", btnOpenFloat.onclick);

//生成关闭浮动状态的按钮
var btnCloseFloat = divButtonBox.appendChild(document.createElement("button"));
btnCloseFloat.className = "ewh-cpt-btn material-icons ewh-btn-closefloat";
btnCloseFloat.title = "关闭浮动窗体";
btnCloseFloat.appendChild(document.createElement("span").appendChild(document.createTextNode("close")));
btnCloseFloat.onclick = function(){
	//ewhWindow.setAttribute("style_bak",ewhWindow.getAttribute("style"));
	if (ewhWindow.style.left) GM_setValue("floatwindow-left",ewhWindow.style.left); //储存窗体位置
	if (ewhWindow.style.top) GM_setValue("floatwindow-top",ewhWindow.style.top); //储存窗体位置
	if (ewhWindow.style.opacity) GM_setValue("floatwindow-opacity",ewhWindow.style.opacity); //储存窗体透明度
	ewhWindow.removeAttribute("style");
	ewhWindow.classList.remove("ewh-float");
};
GM_registerMenuCommand("重置浮动窗位置与透明度", function(){
	btnCloseFloat.onclick(); //先关掉窗体，然后删除设置
	GM_deleteValue("floatwindow-left");
	GM_deleteValue("floatwindow-top");
	GM_deleteValue("floatwindow-opacity");
});

//获取标签数据列表
var tagdatalist = document.querySelector("#tbs-tags");
//获取真实标签输入框
var newTagText = document.querySelector("#newtagfield");
if (!tagdatalist) //没有ETS，但有ETS扩展版的处理方式
{
	var tagDataStr = localStorage.getItem("EhSyringe.tag-list"); //ETS扩展版1.2.1的数据
	if (typeof(tagDataStr) == "string")
	{
		var nameSpaceC = {
			artist:"艺术家",
			female:"女性",
			male:"男性",
			parody:"原作",
			character:"角色",
			group:"团队",
			language:"语言",
			reclass:"重新分类",
			misc:"杂项"
		};
		var tagData = JSON.parse(tagDataStr);
		var tagdatalist = document.createElement("datalist");
		tagdatalist.id = "tbs-tags";
		newTagText.setAttribute("list","tbs-tags");
		tagData.forEach(function(tag){
			tagdatalist.appendChild(new Option(nameSpaceC[tag.namespace]+":"+tag.name,tag.search));
		})
		newTagText.insertAdjacentElement('afterend',tagdatalist);
	}
}
if (tagdatalist) //如果存在则生成标签搜索框
{
	var taglist = tagdatalist.options;
	//增加标签搜索框箱子
	var divSearchBar = ewhWindow.insertBefore(document.createElement("div"),document.querySelector("#tagmenu_act"));
	divSearchBar.className = "ewh-bar-tagsearch";

	//增加标签搜索框
	var iptTagSearch = divSearchBar.appendChild(document.createElement("input"));
	iptTagSearch.type = "text";
	iptTagSearch.placeholder = "🔍标签搜索：回车附加到下方▼";
	iptTagSearch.setAttribute("list","tbs-tags");
	iptTagSearch.className="ewh-ipt-tagsearch";
	//增加标签搜索提醒文字
	var spnTagSearchInfo = divSearchBar.appendChild(document.createElement("span"));
	spnTagSearchInfo.className="ewh-tagsearchtext";
	//增加标签搜索提醒标签
	var aTagSearchInfo = divSearchBar.appendChild(document.createElement("a"));
	aTagSearchInfo.className="ewh-tagsearchlink";

	iptTagSearch.onkeypress = function(e){
		if(e.keyCode==13){ //回车，将内容附加到真实Tag框，并清空搜索框
			if (this.value == 0)
			{ //如果什么都没输入
				spnTagSearchInfo.innerHTML = "";
				aTagSearchInfo.removeAttribute("id");
				aTagSearchInfo.innerHTML = "";
				if (newTagText.value.length > 0)tag_from_field(); //如果输入框有内容点击Tag提交
				return;
			};
			var clabel = false, useGuess = false, guess = false;
			if (this.value.replace(/[\w\:\"\s\-\.\'\$]/,"").length>0) useGuess = true; //如果存在非tag字符，则尝试搜索中文。
			for (var ti=0;ti<taglist.length;ti++)
			{ //循环搜索列表中是否已存在这个Tag
				if (taglist[ti].value == this.value)
				{
					clabel = taglist[ti].label;
					break;
				}else if(useGuess && taglist[ti].label.indexOf(this.value)>0)
				{
					clabel = taglist[ti].label;
					guess = true; //标记为猜的
					this.value = taglist[ti].value; //目前的输入修改为猜的tag
					break;
				}
			}
			if (clabel)
			{
				var regArr = /^(\w+):"?([\w+\s\-\'\.]+)\$?"?$/ig.exec(this.value);
				var shortTag = (regArr[1]=="misc"?"":(regArr[1].substr(0,1) + ":")) + regArr[2]; //缩减Tag长度，以便一次能多提交一些Tag
				if ((newTagText.value+","+shortTag).length>200)
				{
					spnTagSearchInfo.innerHTML = "⛔超长（原始标签输入框限定200字符）";
					aTagSearchInfo.removeAttribute("id");
					aTagSearchInfo.innerHTML = "";
				}else
				{
					newTagText.value = (newTagText.value.length>0)?(newTagText.value+","+shortTag):shortTag;
					spnTagSearchInfo.innerHTML = (guess?"程序猜测你想添加":"你添加了")+" " + (tagData?"":(clabel.split(":")[0] + "："));
					aTagSearchInfo.id = "ta_" + (regArr[1]=="misc"?"":regArr[1]+":") + regArr[2].replace(/\s/igm,"_");
					aTagSearchInfo.innerHTML = clabel;
					this.value = "";
				}
			}else
			{
				spnTagSearchInfo.innerHTML = "☹️数据库里没有这个标签";
				aTagSearchInfo.removeAttribute("id");
				aTagSearchInfo.innerHTML = "";
			}
		}
	};
}