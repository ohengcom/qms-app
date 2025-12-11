# Vercel 部署指南 / Vercel Deployment Guide

## 🚀 代码已推送 / Code Pushed

✅ 代码已成功推送到 GitHub
✅ Code successfully pushed to GitHub

**Commit**: `feat: implement authentication system`
**Branch**: `main`

---

## 📋 Vercel 部署步骤 / Deployment Steps

### 步骤 1: 配置环境变量 / Step 1: Configure Environment Variables

在 Vercel 项目设置中添加以下环境变量：
Add the following environment variables in your Vercel project settings:

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 选择您的项目 / Select your project: `qms-app`
3. 进入 Settings → Environment Variables
4. 添加以下变量 / Add these variables:

```env
# Authentication (Required)
QMS_PASSWORD_HASH="$2b$12$uJRkfI6XXJ0Vuj9WAyPcK.gueJlNrOE5cJl5bnHq3Xvm4PxNs4IeK"
QMS_JWT_SECRET="d0318b9da09951e8dd912ae21296b579c868f986e8f600719bf82c1fcdde91ff"

# Database (Already configured)
DATABASE_URL="your-neon-database-url"
```

**重要提示 / Important Notes:**

- ⚠️ 这些是测试密码的哈希值 / These are test password hashes
- ⚠️ 测试密码是：`TestPassword123`
- ⚠️ 生产环境请使用更强的密码 / Use stronger password for production
- ⚠️ 确保在所有环境（Production, Preview, Development）中添加

---

### 步骤 2: 触发部署 / Step 2: Trigger Deployment

Vercel 会自动检测到 GitHub 推送并开始部署。
Vercel will automatically detect the GitHub push and start deployment.

**检查部署状态 / Check Deployment Status:**

1. 访问 Vercel Dashboard
2. 查看 Deployments 标签
3. 等待部署完成（通常 2-3 分钟）

**或者手动触发 / Or manually trigger:**

```bash
# 如果安装了 Vercel CLI
vercel --prod
```

---

### 步骤 3: 验证部署 / Step 3: Verify Deployment

部署完成后，访问您的生产 URL：
After deployment completes, visit your production URL:

**生产 URL / Production URL:**

```
https://qms-app-omega.vercel.app
```

**预期行为 / Expected Behavior:**

1. ✅ 自动重定向到 `/login`
2. ✅ 显示登录页面
3. ✅ 可以使用密码登录：`TestPassword123`
4. ✅ 登录后可以访问应用

---

## 🧪 测试清单 / Testing Checklist

### 基础功能测试 / Basic Functionality

- [ ] **访问主页** - 自动重定向到登录页

  ```
  https://qms-app-omega.vercel.app
  ```

- [ ] **登录功能** - 使用测试密码登录
  - 密码：`TestPassword123`
  - 应该成功登录并重定向到仪表板

- [ ] **路由保护** - 尝试直接访问受保护页面

  ```
  https://qms-app-omega.vercel.app/quilts
  https://qms-app-omega.vercel.app/usage
  https://qms-app-omega.vercel.app/settings
  ```

  - 未登录时应该重定向到登录页

- [ ] **登出功能** - 点击右上角登出按钮
  - 应该清除 session 并重定向到登录页

- [ ] **错误密码** - 尝试使用错误密码登录
  - 应该显示错误消息

- [ ] **速率限制** - 连续尝试 5 次错误密码
  - 第 6 次应该显示速率限制消息

### 双语支持测试 / Bilingual Support

- [ ] **中文界面** - 切换到中文
  - 所有认证相关文本应该是中文

- [ ] **英文界面** - 切换到英文
  - 所有认证相关文本应该是英文

### 安全测试 / Security Testing

- [ ] **Cookie 设置** - 检查浏览器开发者工具
  - Cookie 名称：`qms-session`
  - 应该有 `HttpOnly` 标志
  - 应该有 `Secure` 标志（生产环境）
  - 应该有 `SameSite=Lax`

- [ ] **Session 持久化** - 登录后关闭浏览器
  - 重新打开应该仍然保持登录状态（如果勾选了"记住我"）

- [ ] **API 保护** - 尝试直接访问 API

  ```
  https://qms-app-omega.vercel.app/api/quilts
  ```

  - 未登录时应该返回 401 Unauthorized

---

## 🔧 故障排除 / Troubleshooting

### 问题 1: 无法登录 / Cannot Login

**症状 / Symptoms:**

- 输入正确密码但无法登录
- 显示"Authentication is not configured"错误

**解决方案 / Solution:**

1. 检查 Vercel 环境变量是否已设置
2. 确认 `QMS_PASSWORD_HASH` 和 `QMS_JWT_SECRET` 已添加
3. 重新部署项目

**验证环境变量 / Verify Environment Variables:**

```bash
# 在 Vercel Dashboard 中
Settings → Environment Variables → 检查是否存在
```

---

### 问题 2: 一直重定向到登录页 / Keeps Redirecting to Login

**症状 / Symptoms:**

- 登录成功但立即重定向回登录页
- 无法访问任何页面

**解决方案 / Solution:**

1. 清除浏览器 cookies
2. 检查 JWT secret 是否正确配置
3. 查看浏览器控制台错误
4. 检查 Vercel 部署日志

---

### 问题 3: 环境变量未生效 / Environment Variables Not Working

**症状 / Symptoms:**

- 环境变量已添加但应用无法读取

**解决方案 / Solution:**

1. 确保环境变量添加到正确的环境（Production）
2. 重新部署项目（环境变量更改需要重新部署）
3. 检查变量名称是否正确（区分大小写）

**重新部署 / Redeploy:**

```bash
# 方法 1: 在 Vercel Dashboard 中点击 "Redeploy"
# 方法 2: 推送一个新的 commit
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

---

### 问题 4: Middleware 警告 / Middleware Warning

**症状 / Symptoms:**

- 看到 middleware deprecation 警告

**解决方案 / Solution:**

- ✅ 这是预期的，可以安全忽略
- ✅ 查看 `MIDDLEWARE_DEPRECATION_NOTE.md` 了解详情
- ✅ 功能完全正常

---

## 📊 部署后检查 / Post-Deployment Checks

### 1. 检查部署日志 / Check Deployment Logs

在 Vercel Dashboard 中：

1. 进入 Deployments
2. 点击最新的部署
3. 查看 Build Logs
4. 确认没有错误

### 2. 检查运行时日志 / Check Runtime Logs

在 Vercel Dashboard 中：

1. 进入 Logs 标签
2. 查看实时日志
3. 测试登录时观察日志输出

### 3. 性能检查 / Performance Check

使用 Lighthouse 或 Vercel Analytics：

- 页面加载速度
- 首次内容绘制（FCP）
- 最大内容绘制（LCP）
- 累积布局偏移（CLS）

---

## 🔐 生产环境安全建议 / Production Security Recommendations

### 1. 更改测试密码 / Change Test Password

**当前测试密码 / Current Test Password:**

```
TestPassword123
```

**生成新密码 / Generate New Password:**

```bash
# 本地运行
npm run setup-password "YourStrongProductionPassword123!"

# 复制输出的哈希值到 Vercel 环境变量
```

### 2. 定期轮换密钥 / Rotate Keys Regularly

建议每 3-6 个月更换：

- JWT Secret
- 密码哈希

### 3. 监控登录尝试 / Monitor Login Attempts

- 查看 Vercel 日志中的失败登录尝试
- 设置告警（如果有异常活动）

### 4. 启用 HTTPS / Enable HTTPS

- ✅ Vercel 自动提供 HTTPS
- ✅ 确保所有请求都使用 HTTPS

---

## 📈 监控和分析 / Monitoring and Analytics

### Vercel Analytics

启用 Vercel Analytics 以监控：

- 页面访问量
- 性能指标
- 用户行为

### 自定义监控 / Custom Monitoring

考虑添加：

- Sentry（错误追踪）
- LogRocket（会话重放）
- Google Analytics（用户分析）

---

## 🎯 下一步 / Next Steps

部署成功后：

1. ✅ **测试所有功能** - 使用测试清单
2. ✅ **更改生产密码** - 使用强密码
3. ✅ **配置监控** - 设置错误追踪
4. ✅ **文档更新** - 更新 README 中的部署信息
5. ✅ **团队通知** - 通知团队新的认证系统

---

## 📞 支持 / Support

如果遇到问题：

1. **查看文档**
   - `AUTH_IMPLEMENTATION_SUMMARY.md`
   - `AUTH_TEST_GUIDE.md`
   - `MIDDLEWARE_DEPRECATION_NOTE.md`

2. **检查日志**
   - Vercel 部署日志
   - 浏览器控制台
   - Network 标签

3. **验证配置**
   - 环境变量
   - Git 提交
   - 部署状态

---

## ✅ 部署完成检查清单 / Deployment Completion Checklist

- [ ] 代码已推送到 GitHub
- [ ] Vercel 环境变量已配置
- [ ] 部署成功完成
- [ ] 登录功能正常工作
- [ ] 路由保护正常工作
- [ ] 登出功能正常工作
- [ ] 双语支持正常工作
- [ ] 性能指标良好
- [ ] 安全设置正确
- [ ] 文档已更新

---

**部署时间 / Deployment Time**: 2025-01-XX
**版本 / Version**: 1.0.0 with Authentication
**状态 / Status**: 🚀 Ready for Testing

---

## 🎉 恭喜！/ Congratulations!

认证系统已成功部署到 Vercel！
Authentication system successfully deployed to Vercel!

**生产 URL / Production URL:**
https://qms-app-omega.vercel.app

**测试密码 / Test Password:**
TestPassword123

**开始测试！/ Start Testing!** 🚀
