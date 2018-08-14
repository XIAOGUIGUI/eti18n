const _ = require('lodash-node');
module.exports = (object, config) => {
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
          let name = keyList[i].replace(/(^\s*)|(\s*$)/g, "")
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
          contentKey = config.keyName[key].replace(/(^\s*)|(\s*$)/g, "")
        }
        result.content[contentKey] = object[key].replace(/(^\s*)|(\s*$)/g, "")
      }
      
    }
  }
  return result
}