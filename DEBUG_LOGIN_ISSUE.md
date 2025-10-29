# 登录问题调试指南 / Login Issue Debug Guide

## 🔍 问题：持续要求输入密码

**症状：** 登录后仍然无法访问受保护页面，一直要求输入密码

---

## ✅ 步骤 1: 检查 Vercel 环境变量（最可能的原因）

### 1.1 访问 Vercel Dashboard

1. 打开：https://vercel.com/dashboard
2. 选择项目：`qms-app`
3. 进入：Settings → Environment Variables

### 1.2 确认环境变量存在

必须有以下两个变量：

```
QMS_PASSWORD_HASH
QMS_JWT_SECRET
```

### 1.3 如果不存在，添加环境变量

**点击 "Add New" 按钮，添加：**

**变量 1:**

- Name: `QMS_PASSWORD_HASH`
- Value: `$2b$12$uJRkfI6XXJ0Vuj9WAyPcK.gueJlNrOE5cJl5bnHq3Xvm4PxNs4IeK`
- Environment: ✅ Production ✅ Preview ✅ Development

**变量 2:**

- Name: `QMS_JWT_SECRET`
- Value: `d0318b9da09951e8dd912ae21296b579c868f986e8f600719bf82c1fcdde91ff`
- Environment: ✅ Production ✅ Preview ✅ Development

### 1.4 重新部署（重要！）

环境变量更改后**必须**重新部署：

**方法 1: 在 Vercel Dashboard**

1. 进入 Deployments 标签
2. 找到最新的部署
3. 点击右侧的 "..." 菜单
4. 选择 "Redeploy"
5. 确认重新部署

**方法 2: 推送新的 commit**

```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin main
```

---

## ✅ 步骤 2: 检查浏览器 Cookie

### 2.1 打开浏览器开发者工具

1. 按 F12 打开开发者工具
2. 进入 "Application" 或 "Storage" 标签
3. 左侧选择 "Cookies"
4. 选择您的域名：`https://qms-app-omega.vercel.app`

### 2.2 检查 Cookie

**应该看到：**

- Name: `qms-session`
- Value: 一个长字符串（JWT token）
- HttpOnly: ✓
- Secure: ✓
- SameSite: Lax
- Path: /

**如果没有看到 cookie：**

- 登录 API 可能失败
- 环境变量可能未配置
- Cookie 设置可能有问题

### 2.3 清除 Cookie 并重试

1. 右键点击 `qms-session` cookie
2. 选择 "Delete"
3. 刷新页面
4. 重新登录

---

## ✅ 步骤 3: 检查网络请求

### 3.1 打开 Network 标签

1. F12 → Network 标签
2. 确保 "Preserve log" 已勾选
3. 清空现有日志

### 3.2 尝试登录并观察

**登录请求 (`/api/auth/login`):**

- Method: POST
- Status: 应该是 200
- Response: `{"success": true, "message": "Login successful"}`
- Response Headers: 应该包含 `Set-Cookie: qms-session=...`

**如果状态是 500:**

- 查看 Response 内容
- 可能是环境变量未配置
- 可能是密码哈希不匹配

**如果状态是 401:**

- 密码错误
- 或者密码哈希不匹配

### 3.3 检查后续请求

登录成功后，访问 `/quilts`：

**请求应该：**

- 包含 Cookie: `qms-session=...`
- 返回 200 状态
- 显示页面内容

**如果返回 302 重定向到 /login:**

- Middleware 没有识别 session
- JWT secret 可能不匹配
- Cookie 可能没有正确发送

---

## ✅ 步骤 4: 检查 Vercel 日志

### 4.1 查看运行时日志

1. Vercel Dashboard → 项目
2. 进入 "Logs" 标签
3. 选择 "Runtime Logs"

### 4.2 查找错误

**登录时查找：**

- "QMS_PASSWORD_HASH is not configured"
- "QMS_JWT_SECRET is not defined"
- "Invalid password"
- "Login error"

**访问受保护页面时查找：**

- "Invalid session token"
- "Session expired"
- Middleware 相关错误

---

## ✅ 步骤 5: 测试 API 直接调用

### 5.1 测试登录 API

在浏览器控制台运行：

```javascript
fetch('https://qms-app-omega.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    password: 'TestPassword123',
    remember: false,
  }),
  credentials: 'include',
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**预期输出：**

```json
{
  "success": true,
  "message": "Login successful"
}
```

**如果看到错误：**

- "Authentication is not configured" → 环境变量未设置
- "Invalid password" → 密码哈希不匹配
- 其他错误 → 查看具体错误消息

### 5.2 检查 Cookie 是否设置

登录成功后，在控制台运行：

```javascript
document.cookie;
```

**应该看到：**

```
"qms-session=eyJhbGc..."
```

---

## 🔧 常见问题和解决方案

### 问题 1: "Authentication is not configured"

**原因：** 环境变量未设置

**解决：**

1. 在 Vercel 添加环境变量
2. 重新部署
3. 清除浏览器 cookie
4. 重新登录

### 问题 2: Cookie 设置了但 Middleware 不识别

**原因：** JWT secret 不匹配

**解决：**

1. 确认 Vercel 环境变量中的 `QMS_JWT_SECRET` 正确
2. 确认没有拼写错误
3. 重新部署
4. 清除 cookie 并重新登录

### 问题 3: 登录成功但立即失效

**原因：** Cookie 域名或路径问题

**解决：**

1. 检查 cookie 的 Domain 和 Path 设置
2. 确保 cookie 的 SameSite 设置为 'lax'
3. 确保 Secure 标志在生产环境启用

### 问题 4: 本地工作但 Vercel 不工作

**原因：** 环境差异

**解决：**

1. 确认 Vercel 环境变量已设置
2. 确认 NODE_ENV 在 Vercel 是 'production'
3. 检查 Vercel 部署日志中的错误

---

## 📊 诊断检查清单

请逐项检查：

- [ ] Vercel 环境变量 `QMS_PASSWORD_HASH` 已设置
- [ ] Vercel 环境变量 `QMS_JWT_SECRET` 已设置
- [ ] 环境变量应用到 Production 环境
- [ ] 添加环境变量后已重新部署
- [ ] 浏览器中可以看到 `qms-session` cookie
- [ ] Cookie 有 HttpOnly 和 Secure 标志
- [ ] 登录 API 返回 200 状态
- [ ] 登录 API 响应包含 Set-Cookie 头
- [ ] Network 请求包含 Cookie 头
- [ ] Vercel 日志中没有错误
- [ ] 清除了浏览器 cookie 并重试
- [ ] 使用正确的密码：`TestPassword123`

---

## 🎯 快速修复步骤

如果您不确定问题在哪里，按以下顺序操作：

### 1. 确认环境变量（5分钟）

```
1. 访问 Vercel Dashboard
2. Settings → Environment Variables
3. 添加 QMS_PASSWORD_HASH 和 QMS_JWT_SECRET
4. 确保应用到 Production
5. 保存
```

### 2. 重新部署（2分钟）

```
1. Deployments 标签
2. 最新部署 → ... → Redeploy
3. 等待部署完成
```

### 3. 清除浏览器数据（1分钟）

```
1. F12 → Application → Cookies
2. 删除所有 qms-app-omega.vercel.app 的 cookies
3. 关闭开发者工具
4. 刷新页面
```

### 4. 重新测试（1分钟）

```
1. 访问 https://qms-app-omega.vercel.app/quilts
2. 应该重定向到登录页
3. 输入密码：TestPassword123
4. 应该成功登录并访问 quilts 页面
```

---

## 📞 如果问题仍然存在

### 收集以下信息：

1. **浏览器控制台截图**
   - Console 标签的错误
   - Network 标签的登录请求
   - Application 标签的 Cookies

2. **Vercel 日志**
   - Runtime Logs 中的错误消息
   - 部署日志中的警告

3. **测试结果**
   - 登录 API 的响应
   - Cookie 是否设置
   - Middleware 是否运行

---

## ✅ 成功标志

当一切正常工作时，您应该看到：

1. ✅ 登录后重定向到目标页面（如 /quilts）
2. ✅ 可以正常访问所有受保护页面
3. ✅ 刷新页面保持登录状态
4. ✅ Cookie 在浏览器中可见
5. ✅ Network 请求包含 Cookie
6. ✅ 没有控制台错误
7. ✅ Vercel 日志中没有错误

---

**最可能的问题：Vercel 环境变量未配置**

**最快的解决方案：添加环境变量并重新部署**

---

**调试时间：** 2025-01-XX
**版本：** 1.0.1
**状态：** 🔍 调试中
