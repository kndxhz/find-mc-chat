# 环境变量配置说明

## API端点配置

本项目使用环境变量来配置API端点地址。

### 开发环境 (.env.development)

```properties
# 开发环境API地址（留空使用Vite代理，避免CORS问题）
VITE_API_BASE=
```

**说明**：
- 开发环境下，`VITE_API_BASE` 留空
- Vite开发服务器会通过代理将API请求转发到 `http://localhost:5731`
- 这样可以避免跨域问题，无需配置CORS

### 生产环境 (.env.production)

```properties
# 生产环境API地址
VITE_API_BASE=http://localhost:5731
```

**说明**：
- 生产环境下，设置实际的后端API地址
- 可以根据部署情况修改为实际的域名或IP

### 自定义配置

如果需要连接到不同的后端服务器：

1. **开发环境**：修改 `vite.config.ts` 中的代理配置
   ```typescript
   proxy: {
     '/getid': {
       target: 'http://your-backend-server:port',
       changeOrigin: true
     }
   }
   ```

2. **生产环境**：修改 `.env.production` 文件
   ```properties
   VITE_API_BASE=http://your-backend-server:port
   ```

## 工作原理

### 开发环境
```
前端请求 → Vite Dev Server (代理) → 后端服务器
http://localhost:5173/getid → http://localhost:5731/getid
```

### 生产环境
```
前端请求 → 直接访问后端
http://your-domain/api/getid → http://backend-server:5731/getid
```

## 使用方式

在代码中使用：
```javascript
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // 从环境变量读取
  timeout: 10000
})
```

- 开发环境：`baseURL` 为空，请求路径为 `/getid`，由Vite代理转发
- 生产环境：`baseURL` 为 `http://localhost:5731`，请求路径为 `http://localhost:5731/getid`
