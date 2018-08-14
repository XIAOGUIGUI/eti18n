#! /usr/bin/env node
const fs = require('fs')
const os = require('os')
const path = require('path')
const chalk = require('chalk')
const program = require('commander')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const generateFile = require('./generateJsFile')
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
  variableName: 'module.exports',
  langs: ['中文', '英文'],
  keyName: {},
  regex: {}
}
// 提示更新版本
updateNotifier({ pkg, updateCheckInterval: 0 }).notify()

program
  .version(pkg.version)
  .option('-f, --file <excelName>', 'set excel file path when into')
  .option('-c, --config <configPath>', 'config file path')
  .option('-p, --path <generatePath>', 'generate the folder path')
  .option('-e, --excel', 'generate excel file by zh-cn.js')
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
    if (customConfig.variableName) {
      config.variableName = customConfig.variableName
    }
    if (customConfig.keyName) {
      config.keyName = Object.assign(config.keyName, customConfig.keyName)
    }
    if (customConfig.langs) {
      config.langs = config.langs.concat(customConfig.langs)
      config.langs = Array.from(new Set(config.langs))
    }
    if (customConfig.regex) {
      config.regex = Object.assign(config.regex, customConfig.regex)
    }
    if (option.toExcel === false) {
      generateFile(option, config)
    } else { 
      generateExcelFile(option, config)
    }
  })
} else {
  if (option.toExcel === false) {
    generateFile(option, config)
  } else {
    generateExcelFile(option, config)
  }
}