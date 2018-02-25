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
  generatePath: './lang',
  configPath: './config.json',
  position: 'column'
}
let config = {
  fileName: {
    '中文': 'zh-cn',
    '英文': 'en',
    '繁体中文(香港)': 'zh-hk',
    '繁体中文(台湾)': 'zh-tw',
    '印尼语': 'id'
  },
  keyName: {}
}
let templatePath = path.join(__dirname, 'lang.ejs')
let template = fs.readFileSync(templatePath, "utf8")
// 提示更新版本
updateNotifier({ pkg, updateCheckInterval: 0 }).notify()

program
  .version(pkg.version)
  .option('-f, --file <excelName>', 'set excel file path when into')
  .option('-c, --config', 'config file path')
  .option('-p, --path', 'generate the folder path')
  .option('-r, --row', 'config excel lang position row')
  .parse(process.argv)
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
// 如果存在自定义生成路径
if (program.path){
  option.generatePath = program.path
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
console.log(option)
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

// 处理配置参数
if (fs.existsSync(option.configPath)) {
  fs.readFile(option.configPath, 'utf8', (err, data) => {
    if (err) {
      console.log(chalk.red('配置文件格式不规范'))
      return false
    }
    let customConfig = JSON.parse(data)
    if (customConfig.fileName) {
      config.fileName = Object.assign(config.fileName, customConfig.fileName)
    }
    if (customConfig.keyName) {
      config.keyName = Object.assign(config.keyName, customConfig.keyName)
    }
    generateFile()
  })
} else {
  generateFile()
}