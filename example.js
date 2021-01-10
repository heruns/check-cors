;(() => {
  /** 所有请求方法 */
  const METHODS = ["HEAD", "GET", "POST", "PUT", "DELETE"]
  /** 判断一个值是否为 Object 类型 */
  const isObject = (obj) =>
    Object.prototype.toString.call(obj) === "[object Object]"
  /** JSON 序列化，format 为是否要转为易阅读的格式 */
  const jsonStringify = (val, format = true) => {
    return format ? JSON.stringify(val, null, 2) : JSON.stringify(val)
  }
  /** 显示提示信息 */
  const showMessage = (message) => {
    const div = document.createElement("div")
    div.className = "message"
    div.textContent = message
    document.body.appendChild(div)
    setTimeout(() => {
      document.body.removeChild(div)
    }, 3000)
  }

  /** json 编辑器组件 */
  const JsonEditor = {
    template: "#json-editor",
    props: {
      label: String,
      defaultValue: Array,
    },
    data() {
      return {
        editType: "key",
        items: [],
        jsonString: "",
      }
    },
    created() {
      if (this.defaultValue) {
        this.items = this.defaultValue.map((item) => {
          return this.getRow(item.name, item.value, item.checked)
        })
      } else {
        this.items = [this.getRow()]
      }
    },
    methods: {
      // 获取 id
      getId() {
        const id = this._id || 0
        this._id = id + 1
        return id
      },
      getRow(key, value, checked = true) {
        const item = {
          id: this.getId(),
          name: key || "",
          value: value || "",
          checked,
        }
        return item
      },
      // 删除问号参数行
      removeRow(item) {
        const index = this.items.indexOf(item)
        this.items.splice(index, 1)
      },
      // 添加问号参数行
      addRow() {
        this.items.push(this.getRow())
      },
      // 编辑问号参数的 json 格式
      editJson() {
        const items = this.items.filter((item) => item.value || item.name)
        const obj = {}
        for (let item of items) {
          if (item.value && !item.name) {
            return showMessage(this.label + " name 不能为空")
          }
          obj[item.name] = item.value
        }
        this.jsonString = jsonStringify(obj)
        this.editType = "json"
      },
      // 格式化 json 内容
      formatJson() {
        let obj
        try {
          obj = this.getJsonObject()
        } catch (e) {
          return showMessage(e.message)
        }
        this.jsonString = jsonStringify(obj)
      },
      // 获取 问号参数 json 对应的对象
      getJsonObject() {
        if (!this.jsonString) return {}
        let obj
        try {
          obj = JSON.parse(this.jsonString)
        } catch (e) {
          throw new Error(this.label + " json 格式不正确")
        }
        if (!isObject(obj)) {
          throw new Error(this.label + "不是对象格式")
        }
        return obj
      },
      // 编辑问号参数的 key-value 格式
      editKey() {
        let obj
        try {
          obj = this.getJsonObject()
        } catch (e) {
          return showMessage(e.message)
        }
        const keys = Object.keys(obj)
        const items = keys.map((key) => {
          return this.getRow(key, obj[key])
        })
        if (!items.length) {
          items.push(this.getRow())
        }
        this.items = items
        this.editType = "key"
      },
      // 获取数据
      getData() {
        if (this.editType === "json") {
          return this.getJsonObject()
        } else {
          const items = this.items.filter(
            (item) => item.checked && (item.value || item.name)
          )
          const obj = {}
          for (let item of items) {
            if (item.value && !item.name) {
              throw new Error(this.label + " name 不能为空")
            }
            obj[item.name] = item.value
          }
          return obj
        }
      },
    },
  }

  const app = new Vue({
    el: "#app",
    components: {
      JsonEditor,
    },
    data() {
      return {
        // url 示例
        examples: [
          {
            text: "支持跨域",
            url: "GET:https://www.fastmock.site/api/countData",
          },
          {
            text: "不支持跨域",
            url: "GET:https://api.juejin.cn/recommend_api/v1/short_msg/hot",
          },
        ],
        url: "",
        METHODS,
        method: "GET",
        message: "",
        res: null,
        body: "",
        defaultHeaders: [
          {
            name: "Content-Type",
            value: "application/json;charset=UTF-8",
            checked: false,
          },
        ],
      }
    },
    computed: {
      // 当前请求方法是否可以设置 body
      canSetBody() {
        return this.method === "POST" || this.method === "PUT"
      },
    },
    watch: {
      method() {
        if (this.canSetBody && !this.body) {
          const body = {
            name: "Run",
            location: "Guangzhou",
          }
          this.body = jsonStringify(body)
        }
      },
    },
    methods: {
      // 使用示例 url
      useExample(exampleUrl) {
        const colonIndex = exampleUrl.indexOf(":")
        this.method = exampleUrl.slice(0, colonIndex)
        this.url = exampleUrl.slice(colonIndex + 1)
      },
      // 获取请求完整的 url
      getUrl() {
        const url = this.url
        if (!url) {
          throw new Error("url 不能为空")
        }
        let jsonString
        try {
          jsonString = this.getQuery()
        } catch (e) {}
        if (!jsonString) {
          return url
        }
        const connector = url.indexOf("?") > -1 ? "&" : "?"
        return url + connector + jsonString
      },
      // 获取请求头
      getRequestHeaders() {
        return this.$refs.headerEditor.getData()
      },
      // 获取待提交的 query 参数
      getQuery() {
        const data = this.$refs.queryEditor.getData()
        let jsonStrings = []
        const pushKeyValue = (key, value) => {
          key = encodeURIComponent(key)
          value = encodeURIComponent(value)
          jsonStrings.push(`${key}=${value}`)
        }
        const keys = Object.keys(data)
        keys.forEach((key) => {
          pushKeyValue(key, data[key])
        })
        return jsonStrings.join("&")
      },
      // 获取用户填写的 body
      getBody(format = false) {
        if (!this.canSetBody || !this.body) return null
        let bodyObject
        try {
          bodyObject = JSON.parse(this.body)
        } catch (e) {
          throw new Error("body json 格式不正确")
        }
        if (!isObject(bodyObject)) {
          throw new Error("body 不是对象格式")
        }
        return jsonStringify(bodyObject, format)
      },
      // 格式化body内容
      formatBody() {
        try {
          this.body = this.getBody(true)
        } catch (e) {
          showMessage(e.message)
        }
      },
      // 发送请求
      async send() {
        let url
        let init
        try {
          url = this.getUrl()
          init = {
            method: this.method,
            // mode: "no-cors",
            headers: this.getRequestHeaders(),
          }
          const body = this.getBody()
          if (body) {
            init.body = body
          }
        } catch (e) {
          console.log(e)
          showMessage(e.message)
          return
        }
        const { response, ...cors } = await window.checkCors(url, init)
        this.res = null
        try {
          const responseType = this.getResponseType(response)
          const content = await this.getResponseContent(response, responseType)
          this.res = {
            success: true,
            cors,
            headers: this.getHeaders(response, cors.corsHeaders),
            status: this.getStatus(response),
            responseType,
            response,
            content,
          }
        } catch (e) {
          this.res = {
            success: false,
          }
          throw e
        }
      },
      // 获取响应类型
      getResponseType(response) {
        if (!response) return ""
        const contentType = response.headers.get("Content-Type")
        if (!contentType) return contentType
        if (contentType.includes("application/json")) {
          return "json"
        } else if (contentType.includes("text/html")) {
          return "html"
        }
        return contentType
      },
      // 获取响应内容
      async getResponseContent(response, responseType) {
        if (!response) {
          return ""
        }
        if (responseType === "json") {
          try {
            const result = await response.json()
            return jsonStringify(result)
          } catch (e) {
            return "null"
          }
        }
        return response.text()
      },
      // 获取所有响应头
      getHeaders(response, corsHeaders) {
        if (!response) return []
        const headers = []
        for (let [key, value] of response.headers) {
          headers.push({
            isCorsHeader: corsHeaders[key],
            key,
            value,
          })
        }
        return headers
      },
      // 获取状态码相关内容
      getStatus(response) {
        if (!response) {
          return {
            text: "请求失败，无法获取到状态码",
            type: "error",
          }
        }
        let type = "info"
        const status = response.status
        if (response.ok) {
          type = "success"
        } else if (status >= 400) {
          type = "error"
        }
        return {
          text: `${status} ${response.statusText}`,
          type,
        }
      },
    },
  })
})()
