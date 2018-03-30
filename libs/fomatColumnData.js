const regexValue = require('./regexValue')
const PROPERT_NAME = '属性名'
const REGEX_NAME = '匹配'
let langMap = {}
let moduleName = ''
let moduleNameZh = ''
let index = 1
let getLangList = object => {
  let result = []
  let j = 0
  for (let key in object) {
    result.push({
        '语言': key
    })
    langMap[key] = j
    j++
  }
  return result
}
let setMoudleName = object => {
  moduleNameZh = object['模块']
  if (object[PROPERT_NAME]){
    moduleName = object[PROPERT_NAME]
  } else {
    moduleName = ''
  }
  index = 1
}

let setLangData = (object, list, config) => {
  let keyName = index
  if (object[PROPERT_NAME]){
    keyName = object[PROPERT_NAME]
  } else {
    index++
  }
  if (moduleName !== '') {
    keyName = moduleName + '.' + keyName
  }
  for (const key in object) {
    // 如果需要匹配，修改变量的值
    if (key === REGEX_NAME) {
      object = regexValue(object, keyName, config)
    } else if (key !== PROPERT_NAME) {
      list[langMap[key]][keyName] = object[key]
    }
  }
  return list
}
module.exports = (list, config) => {
  // 复杂度太高，可以优化
  let result = []
  let listLength = list.length
  result = getLangList(list[0])
  for(let i = 1; i < listLength; i++) {
    let item = list[i]
    if (item['模块']){
      setMoudleName(item)
      continue;
    }
    if (item['翻译'] && item['翻译'] === '否'){
      continue;
    }
    // 如果语言不存在，况且模块名不存在，保存
    if (!item[PROPERT_NAME] && moduleName === '') {
      throw ('模块[' + moduleNameZh + ']属性名不存在时，请填写['+ item['中文']+ ']属性名')
    } else {
      result = setLangData(item, result, config)
    }
  }
  return result
}