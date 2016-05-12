#EhTagTranslator
将E绅士tag翻译成中文。

上一版为JS写的[Etag](https://greasyfork.org/scripts/17966)，每次数据库需要重新更新上传。

这次决定采用开放式编辑的新方法，数据库用本项目的wiki攥写，然后由js生成css，由css来完成翻译显示。

##软件需求
[![](https://www.mozilla.org/media/img/firefox/favicon.dc6635050bf5.ico)FireFox](http://www.firefox.com)安装[![](https://github.com/greasemonkey/greasemonkey/raw/master/skin/icon32.png)GreaseMonkey](http://www.greasespot.net/)扩展。Chrome安装Tampermonkey扩展。再安装[![](https://addons.cdn.mozilla.net/user-media/addon_icons/2/2108-64.png?modified=1453837884)Stylish](https://userstyles.org/)扩展（两者都有）。
##CSS生成方法
先安装“EhTagBuilder”脚本，之后本项目页面下即会显示操作菜单。

![操作菜单](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3sl56gmqpj20o10axwhc.jpg)

点击“生成CSS”，程序运行后会生成窗口显示输出的用户样式。

![输出窗口](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3slcidjl1j20a20aijsn.jpg)

