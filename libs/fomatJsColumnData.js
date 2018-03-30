module.exports = (data, config) => {
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