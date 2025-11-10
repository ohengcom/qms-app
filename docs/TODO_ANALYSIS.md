# TODO 注释分析和处理计划

**分析日期**: 2025-11-10  
**总数**: 27 处  
**状态**: 待处理

---

## 📊 TODO 分类

### 1. 简单修复 (3 处) - 立即处理

#### 错误提示 Toast (2 处)

- `src/components/quilts/StatusChangeDialog.tsx:88` - 显示错误提示
- `src/components/quilts/QuiltDialog.tsx:166` - 显示错误提示

**优先级**: 🔴 高  
**工作量**: 5 分钟  
**建议**: 立即添加 toast.error() 调用

#### 错误追踪服务 (1 处)

- `src/lib/error-handler.ts:157` - 集成 Sentry

**优先级**: 🟡 中  
**工作量**: 可选  
**建议**: 暂时保留，生产环境可选

---

### 2. 功能实现 (18 处) - 需要评估

#### 导入导出功能 (6 处)

**文件**: `src/server/api/routers/import-export.ts`

1. Line 35 - Preview import data
2. Line 54 - Confirm import
3. Line 73 - Export quilts
4. Line 85 - Export quilts to Excel
5. Line 99 - Export usage report
6. Line 115 - Export usage report to Excel
7. Line 136 - Export maintenance report
8. Line 142 - Export maintenance report to Excel

**优先级**: 🟡 中  
**工作量**: 2-3 天（完整实现）或 1 天（简化版）  
**建议**:

- 选项 A: 实现基础导出功能（导出为 JSON/Excel）
- 选项 B: 移除未使用的功能
- 选项 C: 保留 TODO，后续实现

#### 被子使用管理 (5 处)

**文件**: `src/server/api/routers/quilts.ts`

1. Line 151 - Start using a quilt
2. Line 159 - End current usage
3. Line 177 - Get usage history
4. Line 190 - Add maintenance record
5. Line 200 - Get seasonal recommendations

**优先级**: 🔴 高  
**工作量**: 2-3 天  
**建议**: 这些是核心功能，应该实现

**注意**: 部分功能可能已通过其他方式实现（如状态变更）

#### 仪表板功能 (2 处)

**文件**: `src/server/api/routers/dashboard.ts`

1. Line 48 - Get recent activity
2. Line 51 - Get top used quilts

**优先级**: 🟢 低  
**工作量**: 1 天  
**建议**: 可选功能，后续实现

#### 报告生成 (1 处)

**文件**: `src/components/dashboard/QuickActions.tsx`

1. Line 146 - Implement report generation

**优先级**: 🟢 低  
**工作量**: 1-2 天  
**建议**: 取决于业务需求

#### 其他功能 (4 处)

- 各种小功能和优化

**优先级**: 🟢 低  
**工作量**: 各异  
**建议**: 根据需要逐个评估

---

## 🎯 推荐处理方案

### 方案 A: 快速清理（推荐）

**立即处理** (30 分钟):

1. ✅ 添加错误 toast (2 处)
2. ✅ 评估已实现的功能，移除过时的 TODO

**结果**:

- 减少 TODO 到 ~20 处
- 改善用户体验（错误提示）
- 清理过时注释

### 方案 B: 功能实现（1-2 周）

**实现核心功能**:

1. 被子使用管理 (5 个 API)
2. 基础导入导出 (2-3 个功能)
3. 仪表板增强 (2 个功能)

**结果**:

- 功能更完整
- 减少 TODO 到 ~10 处
- 提升产品价值

### 方案 C: 保持现状

**不处理 TODO**:

- 保留所有 TODO 作为未来计划
- 专注于其他优化

**结果**:

- 节省时间
- 保留功能路线图
- TODO 数量不变

---

## 📋 详细 TODO 清单

### 🔴 高优先级 (立即处理)

#### 1. 添加错误提示 (2 处)

**StatusChangeDialog.tsx**:

```typescript
// Line 88
} catch (error) {
  // TODO: Show error toast
  toast.error('状态更新失败');
}
```

**QuiltDialog.tsx**:

```typescript
// Line 166
} catch (error) {
  // TODO: Show error toast
  toast.error('保存失败');
}
```

**工作量**: 5 分钟  
**影响**: 改善用户体验

---

### 🟡 中优先级 (评估后决定)

#### 2. 被子使用管理 (5 处)

**需要检查**: 这些功能是否已通过其他方式实现？

- `startUsage` - 可能通过状态变更实现
- `endUsage` - 可能通过状态变更实现
- `getUsageHistory` - 需要实现
- `addMaintenanceRecord` - 需要实现
- `getSeasonalRecommendations` - 需要实现

**建议**:

1. 检查现有代码
2. 实现缺失的功能
3. 移除已实现的 TODO

#### 3. 导入导出功能 (6 处)

**评估**: 是否需要这些功能？

- 如果需要 → 实现基础版本
- 如果不需要 → 移除相关代码

**建议**:

- 保留基础导出（导出为 JSON）
- 移除复杂的导入功能（如果不需要）

---

### 🟢 低优先级 (后续处理)

#### 4. 仪表板增强 (2 处)

- Recent activity
- Top used quilts

**建议**: 后续版本实现

#### 5. 报告生成 (1 处)

**建议**: 根据业务需求决定

#### 6. 错误追踪 (1 处)

**建议**: 生产环境可选集成 Sentry

---

## 🚀 执行计划

### 阶段 1: 快速修复 (今天，30 分钟)

```bash
# 1. 添加错误提示
- StatusChangeDialog.tsx (添加 toast.error)
- QuiltDialog.tsx (添加 toast.error)

# 2. 检查已实现的功能
- 查看 quilts router
- 查看 usage router
- 移除过时的 TODO
```

**预期结果**: TODO 从 27 → ~20 处

### 阶段 2: 功能评估 (本周)

```bash
# 1. 评估被子使用管理
- 检查哪些已实现
- 列出需要实现的功能

# 2. 评估导入导出
- 确定业务需求
- 决定实现范围

# 3. 更新 TODO
- 移除已实现的
- 更新未实现的描述
```

**预期结果**: 清晰的功能路线图

### 阶段 3: 功能实现 (下周)

```bash
# 根据评估结果实现功能
- 优先实现核心功能
- 移除不需要的功能
- 更新文档
```

**预期结果**: TODO 从 ~20 → ~10 处

---

## 💡 建议

### 立即执行

1. ✅ 添加 2 处错误提示（5 分钟）
2. ✅ 检查已实现的功能（15 分钟）
3. ✅ 移除过时的 TODO（10 分钟）

### 本周执行

1. 📋 评估被子使用管理功能
2. 📋 评估导入导出需求
3. 📋 更新功能路线图

### 后续执行

1. 📅 实现核心功能
2. 📅 完善文档
3. 📅 持续优化

---

## 📊 预期效果

### 快速修复后

- TODO: 27 → ~20 处 (-26%)
- 用户体验: 改善（有错误提示）
- 代码清晰度: 提升

### 功能实现后

- TODO: 27 → ~10 处 (-63%)
- 功能完整性: 显著提升
- 产品价值: 增加

---

**分析完成**: 2025-11-10  
**建议**: 先执行快速修复（30 分钟）  
**下一步**: 添加错误提示 toast
