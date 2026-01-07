# 🚀 部署指南 / Deployment Guide

**最后更新 / Last Updated**: 2026-01-07  
**当前版本 / Current Version**: 1.1.0

---

## 📊 部署概览 / Deployment Overview

QMS 项目部署在 Vercel 平台，使用 Neon PostgreSQL 作为数据库。

### 部署架构

```
GitHub Repository → Vercel (自动部署) → Production
                         ↓
                  Neon PostgreSQL
```

### 部署 URL

- **生产环境**: https://your-app-domain.vercel.app
- **GitHub 仓库**: https://github.com/ohengcom/qms-app

---

## 🔧 部署步骤 / Deployment Steps

### 1. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

```env
# 数据库
DATABASE_URL=postgresql://...

# 认证
QMS_PASSWORD_HASH=<bcrypt hash>
QMS_JWT_SECRET=<jwt secret>

# 外部服务（可选）
OPENWEATHERMAP_API_KEY=<api key>
CLOUDINARY_URL=<cloudinary url>
```

### 2. 部署命令

```bash
# 推送到 GitHub 自动触发部署
git push origin main

# 或手动部署
vercel --prod
```

### 3. 部署验证

部署完成后验证：

1. ✅ 访问生产 URL
2. ✅ 登录功能正常
3. ✅ 数据库连接正常
4. ✅ 所有页面加载正常

---

## ✅ 部署检查清单 / Deployment Checklist

### 部署前

- [ ] 代码通过 ESLint 检查 (`npm run lint`)
- [ ] 代码通过 TypeScript 检查 (`npm run type-check`)
- [ ] 本地构建成功 (`npm run build`)
- [ ] 环境变量已配置

### 部署后

- [ ] 生产 URL 可访问
- [ ] 登录功能正常
- [ ] 仪表板数据显示正常
- [ ] 被子管理功能正常
- [ ] 使用记录功能正常
- [ ] 无控制台错误

---

## 🔍 故障排除 / Troubleshooting

### 常见问题

#### 1. 构建失败

```bash
# 检查构建日志
vercel logs

# 本地测试构建
npm run build
```

#### 2. 数据库连接失败

- 检查 `DATABASE_URL` 环境变量
- 确认 Neon 数据库状态
- 检查 IP 白名单设置

#### 3. 认证问题

- 检查 `QMS_PASSWORD_HASH` 和 `QMS_JWT_SECRET`
- 重新生成密码哈希：`npm run setup-password "YourPassword"`

### 回滚方案

如需回滚到之前版本：

```bash
# 在 Vercel 控制台选择之前的部署
# 或使用 Git 回滚
git revert HEAD
git push
```

---

## 📈 性能指标 / Performance Metrics

### 目标指标

| 指标                     | 目标    |
| ------------------------ | ------- |
| First Contentful Paint   | < 1.5s  |
| Largest Contentful Paint | < 2.5s  |
| First Input Delay        | < 100ms |
| Cumulative Layout Shift  | < 0.1   |

### 监控

- Vercel Analytics（内置）
- 浏览器 DevTools Lighthouse

---

## 🔗 相关文档 / Related Documentation

- [Vercel 环境配置](./guides/VERCEL-ENV-SETUP.md)
- [Vercel 部署指南](./guides/VERCEL_DEPLOYMENT_GUIDE.md)
- [生产测试清单](./PRODUCTION_TESTING_CHECKLIST.md)
- [备份恢复指南](./BACKUP_RESTORE_GUIDE.md)

---

**维护者 / Maintainer**: QMS Team
