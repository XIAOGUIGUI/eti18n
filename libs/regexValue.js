let regexList = []
// 获取需要正则匹配的数组
let getRegexList = (regexKey, keyName, config) => {
  if(regexKey === '是' && config.regex[keyName]) {
    regexList.push(config.regex[keyName])
  } else if (regexKey === '是' && !config.regex[keyName]){
    throw ('模块[' + keyName + ']的正则匹配设置不存在，请填写检查你的编写文件')
  } else {
    let keyList = regexKey.split(',')
    for (let i = 0; i < keyList.length; i++) {
      if (config.regex[keyList[i]]) {
        regexList.push(config.regex[keyList[i]])
      } else {
        throw ('关键词[' + keyList[i] + ']的正则匹配设置不存在，请填写检查你的config.json文件')
      }
    }
  }
}
let regexValueByList = value => {
  for (let i = 0; i < regexList.length; i++) {
    if (regexList[i].key === '{{}}') {
      let firstIndex = value.indexOf('{{')
      let lastIndex = value.indexOf('}}')
      let key = value.substring(firstIndex, lastIndex + 2)
      let keyData = value.substring(firstIndex + 2, lastIndex)
      let regexKey = new RegExp(key, 'g')
      value = value.replace(regexKey, regexList[i].result[0] + keyData + regexList[i].result[1])
    } else {
      let regexKey = new RegExp(regexList[i].key, 'g')
      value = value.replace(regexKey, regexList[i].result)
    }
    
  }
  return value
}
module.exports = (object, keyName, config) => {
  getRegexList(object['匹配'], keyName, config)
  for(let key in object) {
    if (key !== '匹配' && key !== '属性名') {
      object[key] = regexValueByList(object[key])
    }
  }
  return object
}