# QMS 文档索引

## 📚 文档组织

本目录包含 QMS 项目的所有文档，按类别组织。

## 📁 目录结构

```
docs/
├── INDEX.md              # 本文件 - 文档索引
├── guides/              # 实现指南和教程
├── archive/             # 历史文档和完成总结
└── sessions/            # 开发会话记录
```

## 📖 主要文档

### 项目概览
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - 项目当前状态和功能清单
- [README.md](../README.md) - 英文项目说明
- [README_zh.md](../README_zh.md) - 中文项目说明

## 🎯 实现指南 (guides/)

### 认证系统
- `AUTH_IMPLEMENTATION_SUMMARY.md` - 认证系统实现总结
- `AUTH_TEST_GUIDE.md` - 认证功能测试指南

### 使用追踪
- `USAGE_TRACKING_AUTO_IMPLEMENTATION.md` - 使用追踪自动化完整实现
- `USAGE_TRACKING_AUTO_LOGIC.md` - 使用追踪自动化逻辑设计
- `USAGE_TRACKING_IMPLEMENTATION.md` - 使用追踪基础实现

### 部署和安全
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel 部署完整指南
- `SECURITY_AUDIT_SUMMARY.md` - 安全审计总结

## 📦 归档文档 (archive/)

### Phase 完成总结
- `PHASE1_FINAL_REPORT.md` - Phase 1 最终报告
- `PHASE1_COMPLETE_SUMMARY.md` - Phase 1 完成总结
- `PHASE1C_COMPLETE_SUMMARY.md` - Phase 1C UI 增强完成总结
- `PHASE1_IMPROVEMENTS.md` - Phase 1 改进记录

### 实现记录
- `DASHBOARD_ENHANCEMENTS_SUMMARY.md` - 仪表板增强总结
- `UPDATE_QUILT_NAMES.md` - 被子名称更新记录
- `CLEANUP_SUMMARY.md` - 代码清理总结

### 问题和修复
- `AUTH_TEMPORARILY_DISABLED.md` - 认证临时禁用记录
- `DEBUG_LOGIN_ISSUE.md` - 登录问题调试
- `LOGIN_FIX_SUMMARY.md` - 登录修复总结
- `MIDDLEWARE_DEPRECATION_NOTE.md` - 中间件弃用说明
- `VERCEL_CACHE_ISSUE.md` - Vercel 缓存问题
- `ZOD_UPGRADE_ANALYSIS.md` - Zod 升级分析

## 📝 开发会话 (sessions/)

- `SESSION_SUMMARY_2025-01-15.md` - 2025-01-15 开发会话
- `SESSION_SUMMARY_2025-01-16.md` - 2025-01-16 开发会话

## 🔧 规格文档 (.kiro/specs/)

### project-improvements-2025
- `requirements.md` - Phase 1 需求文档
- `design.md` - Phase 1 设计文档
- `tasks.md` - Phase 1 任务列表

### enhanced-quilt-management
- `requirements.md` - 增强被子管理需求
- `design.md` - 增强被子管理设计
- `tasks.md` - 增强被子管理任务

### tech-stack-upgrade
- `requirements.md` - 技术栈升级需求
- `design.md` - 技术栈升级设计
- `tasks.md` - 技术栈升级任务

## 📊 使用指南

### 新开发者入门
1. 阅读 [README.md](../README.md) 或 [README_zh.md](../README_zh.md)
2. 查看 [PROJECT_STATUS.md](../PROJECT_STATUS.md) 了解当前状态
3. 参考 `guides/` 中的实现指南
4. 查看 `.kiro/specs/` 中的规格文档

### 查找特定功能文档
1. 使用本索引文件快速定位
2. 在 `guides/` 中查找实现指南
3. 在 `archive/` 中查找历史记录

### 了解开发历史
1. 查看 `sessions/` 中的会话记录
2. 阅读 `archive/` 中的 Phase 总结
3. 查看 Git 提交历史

## 🔍 快速查找

### 我想了解...

**认证系统如何工作？**
→ `guides/AUTH_IMPLEMENTATION_SUMMARY.md`

**如何部署到 Vercel？**
→ `guides/VERCEL_DEPLOYMENT_GUIDE.md`

**使用追踪自动化如何实现？**
→ `guides/USAGE_TRACKING_AUTO_IMPLEMENTATION.md`

**项目当前有哪些功能？**
→ `../PROJECT_STATUS.md`

**Phase 1 完成了什么？**
→ `archive/PHASE1_FINAL_REPORT.md`

**最近的开发进展？**
→ `sessions/SESSION_SUMMARY_2025-01-16.md`

## 📅 文档维护

- **创建日期**: 2025-01-16
- **最后更新**: 2025-01-16
- **维护者**: Sean Li

## 📝 文档规范

### 文档命名
- 使用大写字母和下划线
- 描述性名称
- 包含日期（如适用）

### 文档分类
- **guides/**: 永久参考文档
- **archive/**: 历史记录和完成总结
- **sessions/**: 开发会话记录

### 文档格式
- 使用 Markdown 格式
- 包含清晰的标题和章节
- 添加日期和状态信息
- 使用表情符号增强可读性

---

**文档总数**: 20+  
**最后整理**: 2025-01-16
