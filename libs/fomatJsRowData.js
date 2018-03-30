module.exports = data => {
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