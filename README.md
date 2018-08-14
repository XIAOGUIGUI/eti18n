# eti18n
多语言excel文件转换js代码命令行

Internationalized excel documents into js files

## 安装

基于``node``，请确保已具备较新的node环境（>=8.9.0），推荐使用node版本管理工具[nvm](https://github.com/creationix/nvm)，这样不仅可以很方便地切换node版本，而且全局安装时候也不用加sudo了。

安装本项目 **eti18n**

```
$ [sudo] npm install -g eti18n
```

由于国外源实在太慢，建议使用国内源来安装

```
$ [sudo] npm i -g eti18n --registry=https://registry.npm.taobao.org
```

## 快速开始
在文件名为i18n多语言excel文件同级目录下运行以下命令
```
$ eti18n
```
查看命令的参数运行以下命令
```
$ eti18n -h
```

参数 -f 或 --file 指定excel文件

参数-c 或 --config 指定转换配置文件

参数 -p 或 --path 指定生成路径

参数 -e 或 --excel 根据zh-cn.js文件生成excel模板

在项目可以配置npm scripts使用自定义脚本
```
{
  "scripts": {
    "i18n": eti18n -f src/lang/**.xlsx -c src/lang/config -p src/lang/
  }
}
```
在项目根目录运行以下命令
```
$ npm run i18n
```
## 配置文件说明

1. 生成语言多对应js文件名
```
{
  "fileName": {
    "中文": "zh-cn",
    "英文": "en",
    "繁体中文(香港)": "zh-hk"
  }
}
```
2. 匹配替换设置
```
{
  "regex": {
    "day": {
      "key": "{{x}}",
      "result": "{day}"
    },
    "text": {
      "key": "{{}}",
      "type": "include",
      "result": ["<div class='text-all'>","</div>"]
    },
    "text1": {
      "key": "{{}}",
      "result": ["<h1 class='text-1'>","</h1>"]
    },
    "text2": {
      "key": "{{}}",
      "type": "include",
      "result": ["<p class='text-2'>","</p>"]
    }
  }
}
```
## 许可
MIT