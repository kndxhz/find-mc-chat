import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

// 创建实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // 环境变量
  timeout: 10000
})

// 请求拦截
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截
service.interceptors.response.use(
  response => {
    const responseData = response.data
    
    // 处理标准格式 {code: 200, msg: '', data: ...}
    if (responseData.code !== undefined) {
      const { code, msg, data } = responseData
      if (code === 200) return data
      ElMessage.error(msg || 'Error')
      return Promise.reject(new Error(msg))
    }
    
    // 处理自定义格式 {status: 'ok', ...}
    if (responseData.status === 'ok') {
      return responseData
    }
    
    // 直接返回数据
    return responseData
  },
  error => {
    ElMessage.error(error.response?.data?.msg || 'Network Error')
    return Promise.reject(error)
  }
)

export default service