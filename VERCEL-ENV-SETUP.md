# Vercel 环境变量设置指南

## 需要在 Vercel 中设置的环境变量

访问: https://vercel.com/dashboard → 选择项目 → Settings → Environment Variables

### 1. 认证相关（必需）

```bash
QMS_JWT_SECRET=d0318b9da09951e8dd912ae21296b579c868f986e8f600719bf82c1fcdde91ff
QMS_PASSWORD_HASH=$2a$12$8YvQJxJ5K8mGzN.Qx4Zj4eF7Hx9Kp2Lm3Nq5Rs6Tv8Wx0Yz1Az2Bc3
```

### 2. 数据库（必需）

```bash
DATABASE_URL=your-neon-database-url
```

### 3. 应用配置（推荐）

```bash
NEXT_PUBLIC_APP_VERSION=0.2.2
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=info
```

### 4. 可选配置

```bash
# 如果使用 Sentry 错误追踪
SENTRY_DSN=your-sentry-dsn

# 如果使用 Webhook 错误通知
WEBHOOK_ERROR_URL=your-webhook-url
```

## 设置步骤

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择 QMS 项目

2. **进入环境变量设置**
   - 点击 Settings
   - 点击 Environment Variables

3. **添加每个变量**
   - Name: 变量名（如 `NEXT_PUBLIC_APP_VERSION`）
   - Value: 变量值（如 `0.2.2`）
   - Environment: 选择 Production, Preview, Development（根据需要）

4. **保存并重新部署**
   - 点击 Save
   - 环境变量更改后需要重新部署
   - 可以手动触发重新部署，或推送新代码

## 验证环境变量

部署完成后，可以通过以下方式验证：

1. **检查版本号**
   - 访问应用
   - 查看左下角版本号
   - 应该显示 "Version 0.2.2"

2. **检查认证**
   - 尝试访问受保护的路由
   - 应该重定向到登录页
   - 使用密码登录应该成功

3. **检查日志**
   - 在 Vercel Dashboard 查看 Functions 日志
   - 应该看到正确的日志级别和格式

## 常见问题

### Q: 环境变量更新后没有生效？
A: 需要重新部署应用。可以：
- 推送新的 commit
- 或在 Vercel Dashboard 手动触发 Redeploy

### Q: NEXT_PUBLIC_ 前缀的作用？
A: 带 `NEXT_PUBLIC_` 前缀的变量会暴露到浏览器端，可以在客户端组件中使用。
不带前缀的变量只在服务器端可用。

### Q: 如何生成新的 JWT_SECRET？
A: 运行以下命令：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q: 如何生成新的密码哈希？
A: 运行密码设置脚本：
```bash
npm run setup-password
# 或
npx tsx scripts/setup-password.ts
```

## 安全提示

1. ⚠️ **永远不要**将敏感环境变量提交到 Git
2. ⚠️ **定期更换** JWT_SECRET 和密码
3. ⚠️ **使用强密码**生成 PASSWORD_HASH
4. ✅ **使用 Vercel 的环境变量**功能，不要硬编码
5. ✅ **为不同环境**（Production, Preview, Development）设置不同的值

## 更新记录

- 2025-11-03: 添加 NEXT_PUBLIC_APP_VERSION=0.2.2
- 2025-11-03: 更新认证环境变量说明
