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

##CSS安装方法
有三种安装方式。

1. ![从文件安装](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3sm9sinwlj20ow0bqq77.jpg)
  
  点击“直接下载CSS文件”，然后在Stylish菜单中选择“安装文件”。之后将样式命名为“EhTagTranslator”（或者你自己喜爱的其他名字）即可。
2. ![从URL安装](http://ww4.sinaimg.cn/large/6c84b2d6gw1f3sme5420dj20pb0f8tdz.jpg)
  
  复制“直接下载CSS文件”的链接地址，然后在附加组件管理器中选择“从 URL 安装...”。之后将样式命名为“EhTagTranslator”（或者你自己喜爱的其他名字）即可。
3. ![新建空白](http://ww2.sinaimg.cn/large/6c84b2d6gw1f3smf9bgt9j20tt0fbgr4.jpg)

  在Stylish菜单中选择“编写新样式”-“空白样式...”。
  
  ![粘贴代码](http://ww2.sinaimg.cn/large/6c84b2d6gw1f3smf9bgt9j20tt0fbgr4.jpg)
  
  然后复制生成的CSS文本，粘贴到编辑框中。之后将样式命名为“EhTagTranslator”（或者你自己喜爱的其他名字）即可。
