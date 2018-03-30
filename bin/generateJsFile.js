const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const ejs = require('ejs')
const XLSX = require('xlsx')
const fomatColumnData = require('../libs/fomatColumnData')
const fomatLangInfo = require('../libs/fomatLangInfo')
let templatePath = path.join(__dirname, 'lang.ejs')
let template = fs.readFileSync(templatePath, "utf8")
// 获取语言列表
let getLangList = option => {
  let workbook = XLSX.readFile(option.filePath)
  // 获取 Excel 中所有表名
  let sheetNames = workbook.SheetNames
  // 根据表名获取对应某张表
  let worksheet = workbook.Sheets[sheetNames[0]]
  return XLSX.utils.sheet_to_json(worksheet)
}
module.exports = (option, config) => {
  let langList = getLangList(option)
  let listLength = langList.length
  if (listLength.length < 2){
    console.log(chalk.green('文件内容为空，请填写完整再进行转换'))
    return false
  }
  try {
    langList = fomatColumnData(langList, config)
    listLength = langList.length
  } catch (error) {
    console.log(chalk.red(error))
    return false
  }
  
  // if (option.position === 'column') {
  //   langList = fomatColumnData(langList)
  // }
  for(let i = 0; i < listLength; i++) {
    let data = fomatLangInfo(langList[i], config)
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