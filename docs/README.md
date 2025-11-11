# QMS 项目文档

## 📚 文档目录

### UI 优化文档 (`ui-optimization/`)

#### 核心文档

1. **[UI_UNIFICATION_PLAN.md](./ui-optimization/UI_UNIFICATION_PLAN.md)**
   - UI 统一改造的总体计划
   - 包含改造目标、页面清单、组件规范

2. **[UI_UNIFICATION_COMPLETE.md](./ui-optimization/UI_UNIFICATION_COMPLETE.md)**
   - UI 统一改造完成报告
   - 详细的改造前后对比
   - 设计系统说明

3. **[UI_UNIFICATION_FINAL_CHECK.md](./ui-optimization/UI_UNIFICATION_FINAL_CHECK.md)**
   - 最终检查报告
   - 完整的页面检查清单
   - 验证方法和结果

#### 优化文档

4. **[UI_OPTIMIZATION_SUGGESTIONS.md](./ui-optimization/UI_OPTIMIZATION_SUGGESTIONS.md)**
   - 详细的优化建议
   - 优先级矩阵
   - 实施计划

5. **[UI_OPTIMIZATION_COMPLETE.md](./ui-optimization/UI_OPTIMIZATION_COMPLETE.md)**
   - 第一阶段优化报告（高优先级）
   - 容器样式、间距、标题统一

6. **[UI_OPTIMIZATION_PHASE2_COMPLETE.md](./ui-optimization/UI_OPTIMIZATION_PHASE2_COMPLETE.md)**
   - 第二阶段优化报告（中优先级）
   - 错误提示、卡片内边距、空状态

#### 规范文档

7. **[CARD_PADDING_STANDARDS.md](./ui-optimization/CARD_PADDING_STANDARDS.md)**
   - 卡片内边距规范
   - 使用指南和示例

8. **[SHADCN_TAILWIND_COMPATIBILITY.md](./ui-optimization/SHADCN_TAILWIND_COMPATIBILITY.md)**
   - Shadcn UI 与 Tailwind CSS 兼容性说明

9. **[UI_UNIFICATION_PROGRESS.md](./ui-optimization/UI_UNIFICATION_PROGRESS.md)**
   - 进度追踪文档
   - 完成度统计

---

### 重构文档 (`refactoring/`)

1. **[QUILTS_PAGE_REFACTOR_PLAN.md](./refactoring/QUILTS_PAGE_REFACTOR_PLAN.md)**
   - 被子管理页面重构计划
   - 组件拆分方案

2. **[USAGE_PAGE_REFACTOR_PLAN.md](./refactoring/USAGE_PAGE_REFACTOR_PLAN.md)**
   - 使用记录页面改造计划

3. **[REFACTOR_SUMMARY.md](./refactoring/REFACTOR_SUMMARY.md)**
   - 重构总结

4. **[REFACTOR_COMPLETE.md](./refactoring/REFACTOR_COMPLETE.md)**
   - 重构完成报告

---

## 🎯 快速导航

### 想了解 UI 统一改造？

👉 从 [UI_UNIFICATION_PLAN.md](./ui-optimization/UI_UNIFICATION_PLAN.md) 开始

### 想查看优化建议？

👉 查看 [UI_OPTIMIZATION_SUGGESTIONS.md](./ui-optimization/UI_OPTIMIZATION_SUGGESTIONS.md)

### 想了解设计规范？

👉 查看 [CARD_PADDING_STANDARDS.md](./ui-optimization/CARD_PADDING_STANDARDS.md)

### 想了解重构过程？

👉 查看 [QUILTS_PAGE_REFACTOR_PLAN.md](./refactoring/QUILTS_PAGE_REFACTOR_PLAN.md)

---

## 📊 项目进度

### UI 统一改造

- **状态**: ✅ 完成
- **完成度**: 100%
- **改造页面**: 8 个

### UI 优化

- **第一阶段**: ✅ 完成（高优先级）
- **第二阶段**: ✅ 完成（中优先级）
- **第三阶段**: ⏳ 待定（低优先级）
- **总体完成度**: 85%

### 代码重构

- **被子管理页面**: ✅ 完成
- **使用记录页面**: ✅ 完成
- **其他页面**: ✅ 完成

---

## 🎨 设计系统

### 颜色系统

- 使用 Tailwind CSS 语义化颜色
- `primary`, `secondary`, `muted`, `accent`, `destructive`

### 组件库

- 基于 Shadcn UI
- 统一的 Card, Table, Badge, Button 等组件

### 间距系统

- 页面容器: `space-y-6` (24px)
- 卡片内部: `space-y-4` (16px)
- 表单字段: `space-y-2` (8px)

### 卡片内边距

- 统计卡片: `p-4` (16px)
- 内容卡片: `p-6` (24px)
- 紧凑卡片: `p-3` (12px)

---

## 📝 文档更新日志

### 2025-11-11

- ✅ 创建文档目录结构
- ✅ 整理所有 UI 优化文档
- ✅ 整理所有重构文档
- ✅ 创建文档索引

---

## 🔗 相关链接

- [主 README](../README.md)
- [中文 README](../README_zh.md)
- [项目仓库](https://github.com/ohengcom/qms-app)

---

**最后更新**: 2025-11-11  
**维护者**: Kiro AI
