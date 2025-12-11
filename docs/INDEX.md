# QMS 文档索引 / QMS Documentation Index

**最后更新 / Last Updated**: 2025-12-11  
**版本 / Version**: 1.1.0

---

## 📚 项目架构

QMS（被子管理系统）采用简洁的 REST API 架构：

- **前端**: Next.js 16 + React Query
- **后端**: Next.js API Routes (REST API)
- **数据库**: Neon PostgreSQL
- **部署**: Vercel

```
React Components → Custom Hooks → React Query → fetch API → Next.js API Routes → Repository Layer → Neon Database
```

---

## 📁 目录结构

```
docs/
├── INDEX.md              # 本文件 - 文档索引
├── guides/               # 实现指南
├── UI_OPTIMIZATION.md    # UI 优化文档
├── REFACTORING.md        # 重构文档
├── DEPLOYMENT_SUMMARY.md # 部署总结
├── PROJECT_SUMMARY.md    # 项目总结
├── BACKUP_QUICK_START.md # 备份快速开始
├── BACKUP_RESTORE_GUIDE.md # 备份恢复指南
├── PRODUCTION_TESTING_CHECKLIST.md # 生产测试清单
└── README.md             # 文档说明

根目录文档:
├── README.md             # 项目说明（英文）
├── README_zh.md          # 项目说明（中文）
└── CHANGELOG.md          # 变更日志
```

---

## 🎯 快速导航

### 📖 项目概览

- [README.md](../README.md) - 英文项目说明
- [README_zh.md](../README_zh.md) - 中文项目说明
- [CHANGELOG.md](../CHANGELOG.md) - 变更日志
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目总结

### 📋 需求规格

- [.kiro/specs/SPECS-INDEX.md](../.kiro/specs/SPECS-INDEX.md) - **需求规格总索引**

### 🔧 实现指南 (docs/guides/)

#### 数据库

- [INITIALIZE-DATABASE.md](./guides/INITIALIZE-DATABASE.md) - 数据库初始化

#### 认证与安全

- [PASSWORD-MIGRATION-GUIDE.md](./guides/PASSWORD-MIGRATION-GUIDE.md) - 密码迁移
- [AUTH_IMPLEMENTATION_SUMMARY.md](./guides/AUTH_IMPLEMENTATION_SUMMARY.md) - 认证实现
- [AUTH_TEST_GUIDE.md](./guides/AUTH_TEST_GUIDE.md) - 认证测试指南
- [SECURITY_AUDIT_SUMMARY.md](./guides/SECURITY_AUDIT_SUMMARY.md) - 安全审计
- [CACHE-FIX-GUIDE.md](./guides/CACHE-FIX-GUIDE.md) - 缓存修复指南

#### 部署

- [VERCEL-ENV-SETUP.md](./guides/VERCEL-ENV-SETUP.md) - Vercel 环境配置
- [VERCEL_DEPLOYMENT_GUIDE.md](./guides/VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 部署指南
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 部署总结

#### 使用追踪

- [USAGE_TRACKING_IMPLEMENTATION.md](./guides/USAGE_TRACKING_IMPLEMENTATION.md) - 使用追踪实现
- [USAGE_TRACKING_AUTO_IMPLEMENTATION.md](./guides/USAGE_TRACKING_AUTO_IMPLEMENTATION.md) - 自动化实现
- [USAGE_TRACKING_AUTO_LOGIC.md](./guides/USAGE_TRACKING_AUTO_LOGIC.md) - 逻辑说明

### 📝 技术文档

- [UI_OPTIMIZATION.md](./UI_OPTIMIZATION.md) - UI 优化方案和规范
- [REFACTORING.md](./REFACTORING.md) - 代码重构记录

### 💾 备份与恢复

- [BACKUP_QUICK_START.md](./BACKUP_QUICK_START.md) - 备份快速开始
- [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md) - 备份恢复指南

### ✅ 测试

- [PRODUCTION_TESTING_CHECKLIST.md](./PRODUCTION_TESTING_CHECKLIST.md) - 生产测试清单

---

## 📖 新手入门

1. 阅读 [README_zh.md](../README_zh.md) 了解项目概况
2. 查看 [.kiro/specs/SPECS-INDEX.md](../.kiro/specs/SPECS-INDEX.md) 了解需求规格
3. 参考 [INITIALIZE-DATABASE.md](./guides/INITIALIZE-DATABASE.md) 初始化数据库
4. 参考 [VERCEL_DEPLOYMENT_GUIDE.md](./guides/VERCEL_DEPLOYMENT_GUIDE.md) 部署应用

---

## 🏗️ API 架构

项目使用纯 REST API 架构，所有 API 路由位于 `src/app/api/`：

| 路由                        | 方法             | 说明                 |
| --------------------------- | ---------------- | -------------------- |
| `/api/quilts`               | GET, POST        | 被子列表和创建       |
| `/api/quilts/[id]`          | GET, PUT, DELETE | 被子详情操作         |
| `/api/quilts/[id]/status`   | PUT              | 被子状态变更         |
| `/api/usage`                | GET, POST        | 使用记录列表和创建   |
| `/api/usage/[id]`           | GET, PUT, DELETE | 使用记录详情操作     |
| `/api/usage/active`         | GET              | 活跃使用记录         |
| `/api/dashboard`            | GET              | 仪表板统计           |
| `/api/settings`             | GET, PUT         | 应用设置             |
| `/api/settings/system-info` | GET              | 系统信息（版本号等） |

---

**文档索引版本**: 4.0  
**最后更新**: 2025-12-11  
**维护者**: Sean Li
