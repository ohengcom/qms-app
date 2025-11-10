# QMS 项目清理执行计划

**创建日期**: 2025-11-10  
**预计完成**: 2025-11-17  
**负责人**: 待定

---

## 🎯 目标

对 QMS 项目进行全面清理、优化和整合，提高代码质量、可维护性和性能。

---

## 📅 执行时间表

### 第 1 天: 代码清理准备

- [ ] 创建清理分支 `optimization/cleanup`
- [ ] 备份当前代码
- [ ] 运行完整测试套件
- [ ] 记录当前打包大小

### 第 2-3 天: 移除调试代码

- [ ] 清理 console.log
- [ ] 统一使用 logger 系统
- [ ] 测试所有功能

### 第 4-5 天: 功能完善

- [ ] 处理 TODO 标记
- [ ] 优化图片功能
- [ ] 完善错误处理

### 第 6-7 天: 文档和脚本整理

- [ ] 归档历史文档
- [ ] 清理脚本目录
- [ ] 更新文档索引

---

## 📋 详细任务列表

## 任务 1: 移除调试代码

### 1.1 创建统一的日志工具

**文件**: `src/lib/logger.ts` (已存在，需要确保所有地方使用)

**检查清单**:

- [x] logger.ts 已实现
- [ ] 所有组件使用 logger 而不是 console
- [ ] 生产环境禁用 debug 日志

### 1.2 替换 console.log

**需要修改的文件** (按优先级):

#### 高优先级 (生产代码)

```
1. src/server/api/routers/dashboard.ts
   - 8 处 console.log
   - 替换为 logger.debug

2. src/components/NotificationChecker.tsx
   - 4 处 console.log
   - 替换为 logger.debug

3. src/components/layout/AppLayout.tsx
   - 1 处 console.error
   - 替换为 logger.error

4. src/components/quilts/AdvancedFilters.tsx
   - 2 处 console.error
   - 替换为 logger.error

5. src/components/weather/WeatherWidget.tsx
   - 1 处 console.error
   - 替换为 logger.error

6. src/components/weather/WeatherForecast.tsx
   - 1 处 console.error
   - 替换为 logger.error

7. src/components/quilts/ImageUpload.tsx
   - 1 处 console.error
   - 替换为 logger.error

8. src/components/usage/EditUsageRecordDialog.tsx
   - 2 处 console.error
   - 替换为 logger.error
```

#### 中优先级 (工具和钩子)

```
9. src/hooks/useErrorHandler.ts
   - 1 处 console.error
   - 替换为 logger.error

10. src/lib/error-handler.ts
    - 2 处 console.error
    - 替换为 logger.error

11. src/lib/security-monitor.ts
    - 2 处 console.error
    - 替换为 logger.error

12. src/server/services/CacheService.ts
    - 1 处 console.error
    - 替换为 logger.error
```

#### 低优先级 (开发工具)

```
13. src/hooks/usePerformance.ts
    - 多处 console.log (性能监控)
    - 保留但添加环境检查

14. src/lib/excel-analyzer.ts
    - 10+ 处 console.log
    - 这是分析工具，可以保留

15. src/lib/serviceWorker.ts
    - 3 处 console.log
    - 替换为 logger.debug
```

### 1.3 验证步骤

```bash
# 搜索剩余的 console 调用
npm run lint

# 构建测试
npm run build

# 类型检查
npm run type-check
```

---

## 任务 2: 处理 TODO 和未完成功能

### 2.1 导入导出功能

**文件**: `src/server/api/routers/import-export.ts`

**决策选项**:

#### 选项 A: 完整实现 (推荐)

```typescript
// 实现以下功能:
- previewImport: 预览 Excel 数据
- confirmImport: 导入数据到数据库
- exportQuilts: 导出被子数据
- exportQuiltsToExcel: 生成 Excel 文件
- exportUsageReport: 导出使用报告
- exportMaintenanceReport: 导出维护报告
```

**工作量**: 2-3 天  
**优先级**: 高

#### 选项 B: 简化实现

```typescript
// 只实现核心功能:
- exportQuilts: 导出为 JSON
- exportQuiltsToExcel: 导出为 Excel
```

**工作量**: 1 天  
**优先级**: 中

#### 选项 C: 移除功能

```typescript
// 移除所有导入导出相关代码
// 更新 UI 移除相关按钮
```

**工作量**: 0.5 天  
**优先级**: 低

**建议**: 选择选项 B (简化实现)

### 2.2 被子使用管理

**文件**: `src/server/api/routers/quilts.ts`

**未实现功能**:

```typescript
- startUsage: 开始使用被子
- endUsage: 结束使用
- getUsageHistory: 获取使用历史
- addMaintenanceRecord: 添加维护记录
- getSeasonalRecommendations: 季节推荐
```

**决策**:

- ✅ 保留 - 这些是核心功能
- ⚠️ 需要实现 - 优先级高

**实现计划**:

1. startUsage - 创建新的使用记录
2. endUsage - 结束当前使用
3. getUsageHistory - 查询历史记录
4. addMaintenanceRecord - 添加维护记录
5. getSeasonalRecommendations - 基于季节推荐

**工作量**: 2-3 天

### 2.3 其他 TODO

#### 错误追踪集成

**文件**: `src/lib/error-handler.ts`

```typescript
// TODO: Send to error tracking service (e.g., Sentry)
```

**决策**:

- 🟡 可选 - 生产环境建议集成
- 📅 后续任务

#### 报告生成

**文件**: `src/components/dashboard/QuickActions.tsx`

```typescript
// TODO: Implement report generation
```

**决策**:

- 🟡 可选 - 取决于业务需求
- 📅 后续任务

#### 错误提示

**文件**: `src/components/quilts/QuiltDialog.tsx`

```typescript
// TODO: Show error toast
```

**决策**:

- ✅ 简单修复 - 添加 toast 提示
- ⏱️ 10 分钟

---

## 任务 3: 优化图片功能

### 3.1 提高压缩质量

**文件**: `src/lib/image-utils.ts`

```typescript
const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 800, // 从 600 提高
  maxHeight: 600, // 保持
  quality: 0.8, // 从 0.6 提高到 0.8
  outputFormat: 'image/jpeg',
};
```

### 3.2 修复显示问题

**文件**: `src/components/quilts/QuiltDialog.tsx`

```typescript
// 检查 z-index 冲突
// 添加图片加载错误处理
// 优化预览性能
```

**工作量**: 0.5 天

---

## 任务 4: 清理脚本目录

### 4.1 创建归档目录

```bash
mkdir -p scripts/archive
mkdir -p scripts/migrations
```

### 4.2 移动文件

#### 移动到 scripts/migrations/

```
- migrate-available-to-storage.ts
- migrate-to-unified-usage-table.ts
- drop-old-usage-tables.ts
- run-migration-006.ts
- run-migration-007.ts
```

#### 删除过时的测试脚本

```
- test-edge-runtime-fix.ts
- test-env.ts
- test-session1-improvements.ts
- test-session2-improvements.ts
- test-session3-api-consolidation.ts
- test-ui-fixes.ts
```

#### 保留的工具脚本

```
- audit-translations.ts
- generate-icons.js
- init-system-settings.ts
- seed-test-data.ts
- setup-password.ts
- setup-usage-tracking.ts
- test-notifications.ts
- update-quilt-names.ts
```

### 4.3 更新 package.json

```json
{
  "scripts": {
    // 移除过时的脚本命令
    // 保留常用的工具命令
  }
}
```

**工作量**: 0.5 天

---

## 任务 5: 整理文档

### 5.1 归档临时文档

#### 移动到 docs/archive/

```
- HYDRATION_ERROR_FIX.md
- IMAGE_ISSUE_SUMMARY.md
- IMAGE_DEBUG_GUIDE.md
- CACHE_CLEAR_INSTRUCTIONS.md
```

#### 移动到 docs/guides/

```
- NOTIFICATION_SYSTEM_TESTING.md
```

#### 整合到 CHANGELOG.md

```
- WEATHER_API_CHANGE.md
```

#### 修复后删除

```
- WEATHER_FEATURE_STATUS.md
```

### 5.2 更新主要文档

#### README.md

```markdown
# 更新内容:

- 版本号: 0.5.0
- 功能列表
- 安装说明
- 使用指南
```

#### CHANGELOG.md

```markdown
# 添加:

## [0.5.0] - 2025-11-10

### Added

- 通知系统
- 天气推荐功能
- 图片上传功能

### Fixed

- Hydration 错误
- 图片显示问题
- 缓存问题

### Changed

- 天气 API 改为 Open-Meteo
```

#### docs/INDEX.md

```markdown
# 更新:

- 文档列表
- 快速导航
- 状态标记
```

**工作量**: 1 天

---

## 任务 6: 代码优化

### 6.1 合并重复组件

#### 评估以下组件:

```
- skeleton.tsx vs skeleton-layouts.tsx
- button.tsx vs ripple-button.tsx
- next-image.tsx vs optimized-image.tsx
```

#### 决策标准:

1. 功能是否重叠？
2. 使用频率如何？
3. 合并是否会破坏现有功能？

**工作量**: 1 天

### 6.2 优化导入语句

```bash
# 运行 ESLint
npm run lint

# 自动修复
npm run lint -- --fix

# 检查未使用的导出
npx ts-prune
```

**工作量**: 0.5 天

---

## 📊 进度追踪

### 完成标准

#### 代码质量

- [ ] 无 console.log (除了 logger)
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 构建成功

#### 功能完整性

- [ ] 天气功能正常工作
- [ ] 图片上传和显示正常
- [ ] 所有核心功能可用
- [ ] 无运行时错误

#### 文档完整性

- [ ] README 更新
- [ ] CHANGELOG 更新
- [ ] 文档索引更新
- [ ] 临时文档归档

#### 代码整洁度

- [ ] 脚本目录整理
- [ ] 无过时的测试脚本
- [ ] 无冗余代码
- [ ] 代码格式统一

---

## 🧪 测试计划

### 单元测试

```bash
# 运行所有测试
npm test

# 覆盖率报告
npm run test:coverage
```

### 集成测试

```bash
# 本地构建测试
npm run build
npm run start

# 访问所有页面
- /
- /quilts
- /usage
- /analytics
- /settings
- /weather
```

### 性能测试

```bash
# 打包大小分析
npm run analyze

# Lighthouse 测试
- Performance
- Accessibility
- Best Practices
- SEO
```

---

## 📈 成功指标

### 代码质量指标

- ✅ TypeScript 严格模式通过
- ✅ ESLint 零错误
- ✅ 构建时间 < 2 分钟
- ✅ 打包大小减少 10%

### 功能指标

- ✅ 所有核心功能正常
- ✅ 无运行时错误
- ✅ 页面加载 < 2 秒
- ✅ API 响应 < 500ms

### 文档指标

- ✅ 文档覆盖率 > 80%
- ✅ 无过时文档
- ✅ 清晰的文档结构
- ✅ 易于查找信息

---

## 🚀 部署计划

### 部署前检查

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] CHANGELOG 更新

### 部署步骤

1. 合并到 main 分支
2. 创建版本标签 v0.5.1
3. 推送到 GitHub
4. Vercel 自动部署
5. 验证生产环境

### 部署后验证

- [ ] 所有页面正常加载
- [ ] 功能正常工作
- [ ] 无控制台错误
- [ ] 性能指标正常

---

## 📞 需要支持

### 技术决策

- [ ] 导入导出功能实现方案
- [ ] 错误追踪服务选择
- [ ] 图片存储方案

### 资源需求

- [ ] 开发时间: 7 天
- [ ] 测试时间: 2 天
- [ ] 文档时间: 1 天

---

## 📝 备注

### 风险评估

- 🟡 中风险: 大量代码修改可能引入新问题
- 🟢 低风险: 有完整的测试和回滚计划

### 回滚计划

```bash
# 如果出现问题，回滚到清理前的版本
git checkout main
git reset --hard <commit-before-cleanup>
git push --force
```

### 后续计划

- 添加自动化测试
- 实现 CI/CD 流程
- 性能持续优化
- 功能持续完善

---

**计划创建**: Kiro AI  
**审批状态**: 待审批  
**开始日期**: 待定  
**预计完成**: 待定
