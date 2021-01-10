;(function () {
  /** 把英文单词转为小写 */
  function toLowerCase(str) {
    return str.toLowerCase()
  }
  /** 判断本次请求是否简单请求 */
  function isSimpleRequest(init) {
    if (!init) return true
    const method = toLowerCase(init.method || "get")
    const simpleMethods = ["head", "get", "post"]
    const isSimpleMethod = simpleMethods.indexOf(method) > -1
    if (!isSimpleMethod) return false

    const headers = init.headers
      ? Object.keys(init.headers).map(toLowerCase)
      : []
    const simpleHeaders = [
      "Accept",
      "Accept-Language",
      "Content-Language",
      "Last-Event-ID",
    ].map(toLowerCase)
    const isSimpleHeader = (header) => {
      const lowercaseHeader = toLowerCase(header)
      if (lowercaseHeader === "content-type") {
        const value = init.headers[header]
        const simpleValues = [
          "application/x-www-form-urlencoded",
          "multipart/form-data",
          "text/plain",
        ]
        return simpleValues.indexOf(value) > -1
      } else {
        return simpleHeaders.indexOf(lowercaseHeader) > -1
      }
    }
    return headers.every(isSimpleHeader)
  }
  /** 是否跨域请求相关的 header */
  function isCorsHeader(headerName) {
    const corsRegexp = /^Access\-Control\-/i
    return corsRegexp.test(headerName)
  }
  /** 获取所有与 cors 相关的响应头 */
  function getCorsHeaders(response) {
    const headers = [...response.headers.keys()]
    return headers.reduce((corsHeaders, header) => {
      if (isCorsHeader(header)) {
        corsHeaders[header] = response.headers.get(header)
      }
      return corsHeaders
    }, {})
  }
  /** 判断接口是否跨域 */
  async function checkCors(url, init) {
    let response = null
    let isCors = true
    let corsHeaders = {}
    let corsEnabled = false
    try {
      response = await fetch(url, init)
      isCors = response.type === "cors"
      corsHeaders = getCorsHeaders(response)
      let corsEnabled = isCors
      if (!isCors) {
        corsEnabled = Object.keys.length > 0
      }
    } catch (e) {}
    const isSimple = isSimpleRequest(init)
    return {
      response, // fetch 请求完成返回的响应
      isCors, // 是否跨域请求
      corsHeaders, // 与 cors 相关的响应头
      corsEnabled, // 当前接口是否支持跨域请求
      isSimple, // 本次请求是否简单请求
    }
  }
  window.checkCors = checkCors
})()
