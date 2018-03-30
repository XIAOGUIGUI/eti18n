const XLSX = require('xlsx');
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
// 获取keyList
let getKeyList = object => {
  let result = []
  for(let key in object) {
    result.push(key)
  }
  return result
}
module.exports = option => {
  // 生成多语言Excel文件
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