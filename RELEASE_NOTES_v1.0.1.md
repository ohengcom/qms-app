# QMS v1.0.1 发布说明

**发布日期**: 2025-01-17  
**版本**: 1.0.1  
**类型**: Bug 修复 + 功能增强

---

## 🎯 本次更新概览

这是一个重要的维护版本，修复了多个关键 bug，并添加了用户期待已久的图片查看和数据备份功能。

---

## 🐛 Bug 修复（8个）

### 1. 被子状态更改失败 ✅

**问题**: 点击更改状态时显示 `toasts.failedToUpdateStatus` 错误  
**原因**: StatusChangeDialog 与 quilts/page.tsx 之间的函数签名不匹配  
**修复**:

- 修改了 handleStatusChangeConfirm 函数签名
- 正确处理日期字符串到 Date 对象的转换
- 添加了错误日志输出

### 2. 被子管理页面双击行为不生效 ✅

**问题**: 系统设置中的"被子管理"页双击行为设置不生效  
**原因**: 被子管理页面完全没有实现双击功能  
**修复**:

- 添加了 handleQuiltDoubleClick 函数
- 支持 4 种双击行为：status/edit/view/none
- 更新了所有相关组件支持双击事件
- 添加了用户友好的提示文本

### 3. 使用详情页返回按钮不工作 ✅

**问题**: 点击返回按钮后立即重新进入详情视图  
**原因**: URL 参数未清除，导致 useEffect 重新触发  
**修复**: 在 handleBackToList 中调用 router.push('/usage') 清除 URL 参数

### 4. 通知查询 SQL 参数数量不匹配 ✅

**问题**: Vercel 日志显示 "bind message supplies 3 parameters, but prepared statement requires 2"  
**原因**: PostgreSQL 的 INTERVAL 语法中不能使用参数占位符  
**修复**:

- 使用 JavaScript 计算时间戳代替 SQL INTERVAL 表达式
- 修复了 findSimilar 和 deleteOldReadNotifications 函数

### 5. 图片查看对话框重复关闭按钮 ✅

**问题**: 对话框右上角显示两个 X 按钮  
**原因**: 手动添加的关闭按钮与 Dialog 组件默认按钮重复  
**修复**: 移除手动添加的关闭按钮

### 6. 操作列不整齐 ✅

**问题**: 有图片和无图片的被子操作按钮数量不同，导致列不对齐  
**原因**: 图片按钮只在有图片时显示  
**修复**: 所有被子都显示图片按钮，无图片时点击显示空状态

### 7. 使用详情页面无法获取参数 ✅

**问题**: 访问 /usage/[quiltId] 时显示"被子不存在"  
**原因**: 客户端组件不能通过 props 接收动态路由参数  
**修复**: 使用 useParams() hook 获取 quiltId

### 8. 缺少翻译 ✅

**问题**: quilts.form.notes 显示为未翻译  
**原因**: 翻译文件中缺少该键  
**修复**: 添加了 quilts.form.notes 和 quilts.form.purchaseDate 的中英文翻译

---

## ✨ 新功能

### 1. 被子图片查看器 🖼️

**功能特点**:

- 全屏查看主图和附加图片
- 左右箭头按钮和键盘快捷键切换图片
- 缩略图导航栏，快速跳转到指定图片
- 显示当前图片序号和总数
- 区分主图和附加图片的标签
- 支持 ESC 键关闭对话框

**使用方式**:

- 在被子管理页面点击 📷 图标按钮（列表视图）
- 或点击"查看图片"按钮（网格视图）

### 2. 独立的使用详情页面 📊

**新路由**: `/usage/[quiltId]`

**功能特点**:

- 显示完整的被子信息卡片
- 显示使用历史表格（包含温度数据）
- 智能返回按钮（根据来源返回）
- 可分享的直接链接
- 清晰的 URL 结构

**用户体验改进**:

- 从被子管理页面查看历史：只需点击一次返回
- 从使用追踪页面查看详情：只需点击一次返回
- 浏览器前进/后退按钮正常工作

### 3. 购买日期字段 📅

**功能特点**:

- 在被子添加/编辑表单中添加购买日期输入
- HTML5 日期选择器，用户体验友好
- 限制不能选择未来日期
- 编辑时正确加载现有购买日期
- 字段为可选项，不强制填写

### 4. 数据备份与恢复 💾

**完整的备份解决方案**:

- 详细的备份恢复文档（BACKUP_RESTORE_GUIDE.md）
- 快速开始指南（BACKUP_QUICK_START.md）
- PowerShell 备份脚本（backup-database.ps1）
- PowerShell 恢复脚本（restore-database.ps1）

**功能特点**:

- 支持压缩备份，节省存储空间
- 自动清理旧备份（保留最近 30 个）
- 恢复前自动创建备份，确保安全
- 数据验证和详细的操作日志
- npm 脚本：`npm run backup`, `npm run backup:compress`, `npm run restore`

**备份策略**:

- 3-2-1 备份规则建议
- 多种备份方案对比
- 自动化备份配置指南
- 紧急恢复流程

---

## 🔄 重构

### 简化使用追踪页面

**改进**:

- 移除了内嵌详情视图（删除 176 行代码）
- 所有"查看详情"操作统一跳转到独立页面
- 代码从 466 行减少到 290 行（减少 38%）
- 更清晰的代码结构，更易维护

**用户体验**:

- 统一的导航体验
- 更清晰的页面职责
- 更好的浏览器历史记录支持

---

## 📚 文档更新

### 新增文档

- `docs/BACKUP_RESTORE_GUIDE.md` - 完整的备份恢复指南
- `docs/BACKUP_QUICK_START.md` - 5分钟快速开始
- `scripts/backup-database.ps1` - Windows 备份脚本
- `scripts/restore-database.ps1` - Windows 恢复脚本

### 更新文档

- `README_zh.md` - 更新功能列表和版本信息
- `CHANGELOG.md` - 添加 v1.0.1 更新日志

---

## 🎯 改进细节

### 用户体验改进

- ✅ 操作列按钮对齐一致
- ✅ 返回导航更直观（只需一次点击）
- ✅ 可分享的详情页链接
- ✅ 图片查看体验优化

### 代码质量改进

- ✅ 移除重复代码
- ✅ 简化状态管理
- ✅ 改进错误处理
- ✅ 添加类型安全

### 性能优化

- ✅ 减少不必要的状态更新
- ✅ 优化组件渲染
- ✅ 改进数据获取逻辑

---

## 🔧 技术细节

### 数据库

- `purchase_date` 字段已存在，现在可在 UI 中使用
- SQL 查询优化，避免参数绑定错误

### 路由结构

```
/quilts                    # 被子管理
  └─ 查看历史 → /usage/[quiltId]?from=quilts

/usage                     # 使用追踪
  └─ 查看详情 → /usage/[quiltId]?from=usage

/usage/[quiltId]          # 使用详情（新）
  └─ 返回 → 根据 from 参数返回
```

### 组件结构

```
src/
├── app/
│   ├── quilts/
│   │   └── components/
│   │       ├── QuiltCard.tsx (支持双击和图片查看)
│   │       ├── QuiltTableRow.tsx (支持双击和图片查看)
│   │       └── ...
│   └── usage/
│       ├── page.tsx (简化版，仅列表)
│       └── [quiltId]/
│           └── page.tsx (独立详情页)
└── components/
    ├── quilts/
    │   ├── QuiltImageDialog.tsx (新)
    │   └── ...
    └── usage/
        └── UsageHistoryTable.tsx (新)
```

---

## 📦 升级指南

### 从 v1.0.0 升级

1. **拉取最新代码**:

   ```bash
   git pull origin main
   ```

2. **安装依赖**（如有更新）:

   ```bash
   npm install
   ```

3. **数据库无需迁移**:
   - 所有字段已存在于数据库中
   - 无需运行迁移脚本

4. **重启应用**:
   ```bash
   npm run build
   npm run start
   ```

### 配置备份（可选）

设置自动备份：

```bash
# 测试备份功能
npm run backup

# 设置 Windows 任务计划程序
# 每天凌晨 2:00 运行：
# powershell -File "C:\path\to\qms\scripts\backup-database.ps1" -Compress
```

---

## 🔮 下一步计划

### 即将推出

- [ ] 批量操作优化
- [ ] 高级搜索功能
- [ ] 数据导出增强
- [ ] 移动端优化

### 考虑中

- [ ] 深色模式
- [ ] 标签系统
- [ ] 维护提醒
- [ ] 数据统计图表

---

## 🙏 致谢

感谢所有用户的反馈和建议！

---

## 📞 支持

- **GitHub Issues**: https://github.com/ohengcom/qms-app/issues
- **文档**: https://github.com/ohengcom/qms-app/tree/main/docs

---

**Happy Quilting! 🛏️**
