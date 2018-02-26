#! /usr/bin/env node
const fs = require('fs')
const os = require('os')
const path = require('path')
const chalk = require('chalk')
const program = require('commander')
const ejs = require('ejs')
const mkdirp = require('mkdirp')
const _ = require('lodash-node');
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const XLSX = require('xlsx');
let option = {
  filePath: './i18n',
  jsPath: './zh-cn.js',
  generatePath: './lang',
  generateExcelPath: './i18n.xlsx',
  configPath: './config.json',
  position: 'column',
  toExcel: false
}
let config = {
  fileName: {
    '中文': 'zh-cn',
    '英文': 'en',
    '繁体中文(香港)': 'zh-hk',
    '繁体中文(台湾)': 'zh-tw',
    '印尼语': 'id'
  },
  langs: ['中文', '英文'],
  keyName: {}
}
let templatePath = path.join(__dirname, 'lang.ejs')
let template = fs.readFileSync(templatePath, "utf8")
let traversalData = {}
function TraversalObject(obj, parentName, result) {
  for (var a in obj) {
    let key = a
    if (parentName) {
      key = parentName + '.' + a   
    }
    if (typeof (obj[a]) == "object") {
      TraversalObject(obj[a], key, result); //递归遍历
    } else {
      result[key] = obj[a]
    }
  }
}
// 提示更新版本
updateNotifier({ pkg, updateCheckInterval: 0 }).notify()

program
  .version(pkg.version)
  .option('-f, --file <excelName>', 'set excel file path when into')
  .option('-c, --config', 'config file path')
  .option('-p, --path', 'generate the folder path')
  .option('-e, --excel', 'generate excel file by zh-cn.js')
  .option('-r, --row', 'config excel lang position row')
  .parse(process.argv)

let validateExcelFile = () => {
  if (program.file){
    if (/\.(xls|xlsx)$/i.test(program.file)) {
      option.filePath = program.file
    } else {
      console.log(chalk.red('只支持xls及xlsx格式文件'))
      return false
    }
  } else {
    if(fs.existsSync(option.filePath + '.xls')) {
      option.filePath = option.filePath + '.xls'
    } else if (fs.existsSync(option.filePath + '.xlsx')) {
      option.filePath = option.filePath + '.xlsx'
    } else {
      console.log(chalk.red('获取excel文件失败'))
      return false
    }
  }
  return true
}
let validateJsFile = () => {
  if (program.file){
    option.filePath = program.file
  } else {
    option.filePath = option.jsPath
  }
  if (!/\.js$/i.test(option.filePath)) {
    option.filePath += '.js'
  }
  if (!fs.existsSync(option.filePath)) {
    console.log(chalk.red('获取中文语言js文件失败'))
    return false
  }
  return true
}
if(program.excel) {
  option.toExcel = true
}
if (option.toExcel === false) {
  if(validateExcelFile() === false){
    return false
  }
} else {
  if(validateJsFile() === false){
    return false
  }
}
// 如果存在自定义生成路径
if (program.path){
  if (option.toExcel === false) {
    option.generatePath = program.path
  } else {
    if (/\.(xls|xlsx)$/i.test(program.path)) {
      option.generateExcelPath = program.path
    } else if (/\/$/i.test(program.path)) {
      option.generateExcelPath = program.path + 'i18n.xlsx'
    } else {
      option.generateExcelPath = program.path + '/i18n.xlsx'
    }
  }
  
}
// 指定配置文件路径
if (program.config){
  if(fs.existsSync(program.config + '.json')) {
    option.configPath = program.config + '.json'
  } else {
    console.log(chalk.red('指定配置文件不存在'))
    return false
  }
}
if (program.row){
  option.position = 'row'
}
/**
 * 
 * 
 * @returns 语言数组
 */
let getLangList = () => {
  let workbook = XLSX.readFile(option.filePath)
  // 获取 Excel 中所有表名
  let sheetNames = workbook.SheetNames;
  // 根据表名获取对应某张表
  let worksheet = workbook.Sheets[sheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet)
}

let fomatLangInfo = object => {
  let result = {
    fileName: '',
    content: {}
  }
  for (key in object) {
    if (key === '语言') {
      let langName = object[key]
      if (config.fileName[langName]) {
        result.fileName = config.fileName[langName]
      }
    } else {
      let contentKey = key
      let keyList = contentKey.split('.')
      if (keyList.length > 0) {
        let i = keyList.length - 1
        let temp = {}
        do {
          let name = keyList[i]
          if (config.keyName[name]) {
            name = config.keyName[name]
          }
          if (i === keyList.length - 1) {
            temp[name] = object[key].replace(/(^\s*)|(\s*$)/g, "")
          } else {
            let other = {}
            other[name] = temp
            temp = other
          }
          i--
        }while(i > -1)  
        result.content = _.merge(result.content, temp)
      } else {
        if (config.keyName[key]) {
          contentKey = config.keyName[key]
        }
        result.content[contentKey] = object[key].replace(/(^\s*)|(\s*$)/g, "")
      }
      
    }
  }
  return result
}
let fomatColumnData = list => {
  let result = []
  let listLength = list.length
  if (listLength === 0 ) {
    return false
  }
  for (let key in list[0]) {
    if (key !== '语言') {
      result.push({
        '语言': key
      })
    }
  }
  console.log(result)
  for(let i = 0; i < listLength; i++) {
    let keyName = ''
    let j = 0
    for (let key in list[i]) {
      if (key === '语言') {
        keyName = list[i][key]
      } else {
        result[j-1][keyName] = list[i][key]
      }
      j++
    }
  }
  return result
}
// 生成对应语言文件
let generateFile = () => {
  let langList = getLangList()
  if (option.position === 'column') {
    langList = fomatColumnData(langList)
  }
  let listLength = langList.length
  for(let i = 0; i < listLength; i++) {
    let data = fomatLangInfo(langList[i])
    let compiledData = ejs.render(template, data)
    mkdirp(option.generatePath, function (err) {
      if(err) {
        console.log(err)
      }
      fs.writeFileSync(option.generatePath + '/' + data.fileName + '.js', compiledData)
    })
  }
  console.log(chalk.green('转换成功'))
}
let getKeyList = object => {
  let result = []
  for(let key in object) {
    result.push(key)
  }
  return result
}
let fomatJsRowData = data => {
  let result = []
  let langsLength = config.langs.length
  for(let i = 0; i < langsLength; i++) {
    let obj = {
      '语言': config.langs[i]
    }
    for(let key in data) {
      // 下次可以优化是否其他的语言为标准
      if (config.langs[i] === "中文" || config.langs[i] === "zh-cn") {
        obj[key] = data[key]
      } else {
        obj[key] = ''
      }
    }
    result.push(obj)
  }
  return result
}
let fomatJsColumnData = data => {
  let result = []
  let langsLength = config.langs.length
  for(let key in data) {
    let obj = {
      '语言': key
    }
    for(let i = 0; i < langsLength; i++) {
      if (config.langs[i] === "中文" || config.langs[i] === "zh-cn") {
        obj[config.langs[i]] = data[key]
      } else {
        obj[config.langs[i]] = ''
      }
    }
    result.push(obj)
  }
  return result
}
// 生成多语言Excel文件
let generateExcelFile = () => {
  fs.readFile(option.filePath, function (err, data) {
    if (err) {
      console.log(chalk.red(err))
      return false
    }
    let zhData = data.toString()
    let index = zhData.indexOf('{')
    zhData = zhData.slice(index)
    try {
      zhData = JSON.parse(zhData)
      traversalData = {}
      TraversalObject(zhData, null, traversalData)
      let _headers = ['语言']
      if (option.position === 'column') {
        _headers = _headers.concat(config.langs)      
      } else {
        _headers = _headers.concat(getKeyList(traversalData)) 
      }
      _headers = Array.from(new Set(_headers))
      let _data = []
      if (option.position === 'column') {
        _data = fomatJsColumnData(traversalData)      
      } else {
        _data = fomatJsRowData(traversalData) 
      }
      let headers = _headers
        .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {})
      let data = _data
        .map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) })))
        .reduce((prev, next) => prev.concat(next))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {})
      // 合并 headers 和 data
      let output = Object.assign({}, headers, data)
      // 获取所有单元格的位置
      let outputPos = Object.keys(output)
      // 计算出范围
      let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]
      // 构建 workbook 对象
      let wb = {
        SheetNames: ['工作表1'],
        Sheets: {
          '工作表1': Object.assign({}, output, { '!ref': ref })
        }
      }
      // 导出 Excel
      XLSX.writeFile(wb, option.generateExcelPath);
      console.log(chalk.green('生成excel文件成功'))
    } catch (error) {
      console.log(chalk.red(error))
    }
  })
}
// 处理配置参数
if (fs.existsSync(option.configPath)) {
  fs.readFile(option.configPath, 'utf8', (err, data) => {
    if (err) {
      console.log(chalk.red('配置文件格式不规范'))
      return false
    }
    let customConfig = JSON.parse(data)
    if (option.toExcel === false) {
      if (customConfig.fileName) {
        config.fileName = Object.assign(config.fileName, customConfig.fileName)
      }
      if (customConfig.keyName) {
        config.keyName = Object.assign(config.keyName, customConfig.keyName)
      }
      generateFile()
    } else {
      if (customConfig.langs) {
        config.langs = config.langs.concat(customConfig.langs)
        config.langs = Array.from(new Set(config.langs))
      }
      generateExcelFile()
    }
  })
} else {
  if (option.toExcel === false) {
    generateFile()
  } else {
    generateExcelFile()
  }
}