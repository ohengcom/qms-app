# QMS 项目文档 / QMS Project Documentation

## 📚 文档目录 / Documentation Index

本目录包含 QMS（被子管理系统）的所有技术文档。
This directory contains all technical documentation for QMS (Quilt Management System).

---

## 📖 核心文档 / Core Documentation

### 项目概览 / Project Overview

- **[INDEX.md](./INDEX.md)** - 文档索引和快速导航
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 项目总结和完成度

### 技术文档 / Technical Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 项目架构和功能总结
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - 部署配置和说明

### 部署文档 / Deployment Documentation

- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - 部署总结
- **[PRODUCTION_TESTING_CHECKLIST.md](./PRODUCTION_TESTING_CHECKLIST.md)** - 生产测试清单

### 备份与恢复 / Backup & Restore

- **[BACKUP_QUICK_START.md](./BACKUP_QUICK_START.md)** - 备份快速开始
- **[BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md)** - 完整备份恢复指南

---

## 🔧 实现指南 / Implementation Guides

位于 `docs/guides/` 目录：

### 数据库 / Database

- **[INITIALIZE-DATABASE.md](./guides/INITIALIZE-DATABASE.md)** - 数据库初始化

### 认证与安全 / Authentication & Security

- **[AUTH_IMPLEMENTATION_SUMMARY.md](./guides/AUTH_IMPLEMENTATION_SUMMARY.md)** - 认证实现总结
- **[AUTH_TEST_GUIDE.md](./guides/AUTH_TEST_GUIDE.md)** - 认证测试指南
- **[PASSWORD-MIGRATION-GUIDE.md](./guides/PASSWORD-MIGRATION-GUIDE.md)** - 密码迁移指南
- **[SECURITY_AUDIT_SUMMARY.md](./guides/SECURITY_AUDIT_SUMMARY.md)** - 安全审计总结

### 部署 / Deployment

- **[VERCEL-ENV-SETUP.md](./guides/VERCEL-ENV-SETUP.md)** - Vercel 环境配置
- **[VERCEL_DEPLOYMENT_GUIDE.md](./guides/VERCEL_DEPLOYMENT_GUIDE.md)** - Vercel 部署指南

### 使用追踪 / Usage Tracking

- **[USAGE_TRACKING_IMPLEMENTATION.md](./guides/USAGE_TRACKING_IMPLEMENTATION.md)** - 使用追踪实现

---

## 🎨 设计系统 / Design System

### 颜色系统 / Color System

基于 UI/UX Pro Max 研究结果：

| 用途       | 颜色       | Hex     |
| ---------- | ---------- | ------- |
| Primary    | Trust Blue | #2563EB |
| Secondary  | Light Blue | #3B82F6 |
| CTA        | Orange     | #F97316 |
| Background | Light Gray | #F8FAFC |
| Text       | Dark Slate | #1E293B |

### 组件库 / Component Library

- 基于 Shadcn UI + Radix UI
- 统一的 Card, Table, Badge, Button 等组件
- 语义化颜色：`primary`, `secondary`, `muted`, `accent`, `destructive`

### 间距系统 / Spacing System

- 页面容器: `space-y-6` (24px)
- 卡片内部: `space-y-4` (16px)
- 表单字段: `space-y-2` (8px)

---

## 📊 项目状态 / Project Status

### 当前版本 / Current Version

- **版本**: 1.1.0
- **状态**: ✅ 生产就绪

### 技术栈 / Tech Stack

- **前端**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + Shadcn UI
- **数据获取**: React Query
- **数据库**: Neon PostgreSQL
- **部署**: Vercel

---

## 🔗 相关链接 / Related Links

- [主 README](../README.md)
- [中文 README](../README_zh.md)
- [CHANGELOG](../CHANGELOG.md)
- [需求规格索引](../.kiro/specs/SPECS-INDEX.md)

---

**最后更新 / Last Updated**: 2026-01-07  
**维护者 / Maintainer**: QMS Team
