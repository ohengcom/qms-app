# 认证系统测试指南 / Authentication Testing Guide

## ✅ 环境配置完成 / Environment Setup Complete

### 测试密码 / Test Password

```
TestPassword123
```

### 环境变量 / Environment Variables

已配置在 `.env.local` 文件中 / Configured in `.env.local` file

### 开发服务器 / Development Server

- ✅ 正在运行 / Running
- 🌐 URL: http://localhost:3000

---

## 🧪 测试步骤 / Testing Steps

### 1. 测试登录页面 / Test Login Page

**访问应用 / Visit Application:**

```
http://localhost:3000
```

**预期行为 / Expected Behavior:**

- ✅ 自动重定向到登录页面 `/login`
- ✅ 显示美观的登录界面
- ✅ 包含密码输入框
- ✅ 包含"记住我"复选框
- ✅ 包含登录按钮

---

### 2. 测试登录功能 / Test Login Functionality

#### 测试 A: 正确密码登录 / Test A: Login with Correct Password

**步骤 / Steps:**

1. 在密码框输入：`TestPassword123`
2. 点击"登录"按钮

**预期结果 / Expected Result:**

- ✅ 登录成功
- ✅ 重定向到仪表板 `/`
- ✅ 可以看到应用内容
- ✅ 右上角显示"退出登录"按钮

---

#### 测试 B: 错误密码登录 / Test B: Login with Wrong Password

**步骤 / Steps:**

1. 在密码框输入：`WrongPassword123`
2. 点击"登录"按钮

**预期结果 / Expected Result:**

- ✅ 显示错误消息："密码错误" / "Invalid password"
- ✅ 保持在登录页面
- ✅ 不能访问应用

---

#### 测试 C: 速率限制 / Test C: Rate Limiting

**步骤 / Steps:**

1. 连续输入错误密码 5 次
2. 尝试第 6 次登录

**预期结果 / Expected Result:**

- ✅ 显示错误消息："尝试次数过多，请15分钟后再试"
- ✅ 无法继续尝试登录
- ✅ 15 分钟后可以再次尝试

---

#### 测试 D: "记住我"功能 / Test D: Remember Me

**步骤 / Steps:**

1. 勾选"记住我"复选框
2. 输入正确密码：`TestPassword123`
3. 点击登录
4. 关闭浏览器
5. 重新打开浏览器访问应用

**预期结果 / Expected Result:**

- ✅ 无需重新登录
- ✅ 直接进入应用
- ✅ Session 有效期 30 天

---

### 3. 测试路由保护 / Test Route Protection

#### 测试 A: 未登录访问受保护页面 / Test A: Access Protected Pages Without Login

**步骤 / Steps:**

1. 登出（如果已登录）
2. 尝试直接访问以下 URL：
   - `http://localhost:3000/quilts`
   - `http://localhost:3000/usage`
   - `http://localhost:3000/settings`

**预期结果 / Expected Result:**

- ✅ 自动重定向到登录页面
- ✅ 无法访问受保护内容

---

#### 测试 B: 登录后访问受保护页面 / Test B: Access Protected Pages After Login

**步骤 / Steps:**

1. 登录成功
2. 访问以下页面：
   - `/quilts` - 被子管理
   - `/usage` - 使用跟踪
   - `/settings` - 设置
   - `/analytics` - 分析
   - `/reports` - 报告

**预期结果 / Expected Result:**

- ✅ 可以正常访问所有页面
- ✅ 页面内容正常显示
- ✅ 可以进行数据操作

---

### 4. 测试登出功能 / Test Logout Functionality

**步骤 / Steps:**

1. 登录成功后
2. 点击右上角的"退出登录"按钮
3. 确认登出对话框

**预期结果 / Expected Result:**

- ✅ 显示确认对话框："确定要退出登录吗？"
- ✅ 确认后重定向到登录页面
- ✅ Session 被清除
- ✅ 无法访问受保护页面

---

### 5. 测试 Session 过期 / Test Session Expiration

**步骤 / Steps:**

1. 登录成功（不勾选"记住我"）
2. 等待 7 天（或手动修改 cookie 过期时间测试）
3. 尝试访问应用

**预期结果 / Expected Result:**

- ✅ Session 过期
- ✅ 自动重定向到登录页面
- ✅ 显示"会话已过期，请重新登录"

---

### 6. 测试双语支持 / Test Bilingual Support

**步骤 / Steps:**

1. 在登录页面切换语言（右上角语言切换器）
2. 观察界面文本变化

**预期结果 / Expected Result:**

- ✅ 中文界面显示：
  - "密码"
  - "请输入密码"
  - "记住我（30天）"
  - "登录"
- ✅ 英文界面显示：
  - "Password"
  - "Enter your password"
  - "Remember me (30 days)"
  - "Login"

---

### 7. 测试密码可见性切换 / Test Password Visibility Toggle

**步骤 / Steps:**

1. 在密码框输入密码
2. 点击眼睛图标

**预期结果 / Expected Result:**

- ✅ 密码从 `••••••` 变为明文
- ✅ 图标从眼睛变为斜眼睛
- ✅ 再次点击恢复隐藏

---

## 📊 测试检查清单 / Testing Checklist

### 基础功能 / Basic Functionality

- [ ] 登录页面正常显示
- [ ] 正确密码可以登录
- [ ] 错误密码显示错误
- [ ] 登出功能正常
- [ ] 路由保护工作正常

### 安全功能 / Security Features

- [ ] 速率限制工作正常
- [ ] Session 管理正常
- [ ] Cookie 设置正确（HTTP-only）
- [ ] 未认证用户被重定向

### 用户体验 / User Experience

- [ ] 双语支持正常
- [ ] 密码可见性切换正常
- [ ] "记住我"功能正常
- [ ] 错误提示清晰友好
- [ ] 加载状态显示正常

### 高级功能 / Advanced Features

- [ ] Session 过期处理
- [ ] 多标签页同步
- [ ] 浏览器刷新保持登录
- [ ] 移动端响应式正常

---

## 🐛 常见问题 / Troubleshooting

### 问题 1: 无法登录

**解决方案:**

- 检查 `.env.local` 文件是否存在
- 确认环境变量已正确设置
- 重启开发服务器

### 问题 2: 一直重定向到登录页

**解决方案:**

- 清除浏览器 cookies
- 检查 JWT secret 是否配置
- 查看浏览器控制台错误

### 问题 3: 速率限制不工作

**解决方案:**

- 速率限制基于 IP 地址
- 开发环境可能显示为 localhost
- 检查服务器日志

---

## 🎯 测试完成标准 / Test Completion Criteria

认证系统测试通过的标准：
Authentication system passes testing when:

- ✅ 所有基础功能测试通过
- ✅ 所有安全功能测试通过
- ✅ 用户体验良好
- ✅ 无明显 bug 或错误
- ✅ 双语支持完整

---

## 📝 测试报告模板 / Test Report Template

```
测试日期 / Test Date: ___________
测试人员 / Tester: ___________

功能测试结果 / Functionality Test Results:
- 登录功能: [ ] 通过 / Pass  [ ] 失败 / Fail
- 登出功能: [ ] 通过 / Pass  [ ] 失败 / Fail
- 路由保护: [ ] 通过 / Pass  [ ] 失败 / Fail
- 速率限制: [ ] 通过 / Pass  [ ] 失败 / Fail

用户体验 / User Experience:
- 界面美观: [ ] 优秀 / Excellent  [ ] 良好 / Good  [ ] 需改进 / Needs Improvement
- 响应速度: [ ] 快速 / Fast  [ ] 正常 / Normal  [ ] 慢 / Slow
- 错误提示: [ ] 清晰 / Clear  [ ] 一般 / Average  [ ] 不清楚 / Unclear

发现的问题 / Issues Found:
1. ___________
2. ___________
3. ___________

总体评价 / Overall Assessment:
[ ] 通过测试，可以使用 / Passed, Ready to Use
[ ] 需要修复问题 / Needs Fixes
[ ] 需要重新测试 / Needs Retesting
```

---

**开始测试！/ Start Testing!** 🚀

打开浏览器访问：http://localhost:3000
Open your browser and visit: http://localhost:3000
