# 通过 `fetch` API 检测接口是否允许跨域

## demo 地址：[https://heruns.github.io/check-cors/](https://heruns.github.io/check-cors/)

## 功能

通过浏览器的 `fetch` API，检查一个接口是否允许跨域，及判断是否简单请求、获取所有跨域相关的响应头等

# 使用

引入 `check-cors.js` 后就会在页面中注入 `checkCors` 方法，按照 `fetch` 的参数格式传入 `url` 和 `init` 对象调用该方法，将返回一个 `Promise` 对象，`Promise` resolve 后即可获取到一个包含以下信息的对象：

- `response`：`fetch` 请求完成返回的响应
- `isCors`：是否跨域请求
- `corsHeaders`：与 CORS 相关的响应头，仅当当前请求未跨域时可获取到相关响应头
- `corsEnabled`：当前接口是否支持跨域请求
- `isSimple`：本次请求是否简单请求

## 示例

```javascript
window.checkCors(url, init).then(({ response, ...cors }) => {
  console.log(response, cors)
})
```
