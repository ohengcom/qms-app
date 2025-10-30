# 使用追踪自动化逻辑实现文档

## 业务需求

实现被子状态变更时自动创建/更新使用追踪记录的功能。

## 数据流程

### 1. 新被子添加

- **被子管理表**: 新记录，状态 = MAINTENANCE
- **使用追踪表**: 无操作

### 2. 状态改为"使用中" (MAINTENANCE/STORAGE → IN_USE)

- **被子管理表**: 状态 = IN_USE
- **使用追踪表**: 创建新记录
  - `quilt_id`: 被子ID
  - `start_date`: 当前日期（可在对话框中修改）
  - `end_date`: NULL
  - `status`: 'ACTIVE'
  - `usage_type`: 'REGULAR'（默认）
  - `notes`: 可选

### 3. 状态改为"维护中"或"存储中" (IN_USE → MAINTENANCE/STORAGE)

- **被子管理表**: 状态 = MAINTENANCE/STORAGE
- **使用追踪表**: 更新当前活动记录
  - 查找该被子的活动记录 (end_date IS NULL)
  - `end_date`: 当前日期（可在对话框中修改）
  - `status`: 'COMPLETED'

### 4. 手动编辑使用追踪记录

- 允许用户在使用追踪页面手动修改所有字段

## 实现任务

### Phase 1: 数据库和 API

- [ ] 1. 更新数据库 schema
  - [ ] 确认 usage_records 表结构
  - [ ] 添加 status 字段 (ACTIVE/COMPLETED)
  - [ ] 添加索引优化查询

- [ ] 2. 创建数据库操作函数 (src/lib/neon.ts)
  - [ ] `createUsageRecord(quiltId, startDate, notes)` - 创建使用记录
  - [ ] `endUsageRecord(quiltId, endDate)` - 结束使用记录
  - [ ] `getActiveUsageRecord(quiltId)` - 获取活动记录
  - [ ] `updateUsageRecord(id, data)` - 更新使用记录

- [ ] 3. 创建/更新 API 端点
  - [ ] `POST /api/quilts/[id]/status` - 智能状态更新
    - 接收: quiltId, newStatus, startDate?, endDate?
    - 逻辑:
      - 如果 newStatus = IN_USE: 创建使用记录
      - 如果 oldStatus = IN_USE && newStatus != IN_USE: 结束使用记录
      - 更新被子状态
    - 返回: 更新后的被子和使用记录

### Phase 2: UI 组件

- [ ] 4. 增强 StatusChangeDialog 组件
  - [ ] 添加状态检测逻辑
  - [ ] 当改为 IN_USE 时:
    - 显示"开始日期"选择器（默认今天）
    - 显示备注输入框
  - [ ] 当从 IN_USE 改为其他时:
    - 显示"结束日期"选择器（默认今天）
    - 显示当前使用记录信息
    - 显示备注输入框
  - [ ] 添加日期验证
    - 开始日期不能晚于今天
    - 结束日期不能早于开始日期

- [ ] 5. 更新被子列表页面 (src/app/quilts/page.tsx)
  - [ ] 修改 handleChangeStatus 函数
  - [ ] 传递额外的日期参数到 API

- [ ] 6. 增强使用追踪页面 (src/app/usage/page.tsx)
  - [ ] 添加手动编辑功能
  - [ ] 添加编辑对话框
  - [ ] 实现记录更新

### Phase 3: 验证和测试

- [ ] 7. 数据一致性验证
  - [ ] 确保一个被子同时只有一条 ACTIVE 记录
  - [ ] 添加数据库约束或应用层检查
  - [ ] 处理边界情况

- [ ] 8. 用户体验优化
  - [ ] 添加加载状态
  - [ ] 添加成功/错误提示
  - [ ] 添加确认对话框（重要操作）

- [ ] 9. 测试场景
  - [ ] 新被子 → 使用中 → 存储中
  - [ ] 新被子 → 使用中 → 维护中
  - [ ] 存储中 → 使用中 → 存储中
  - [ ] 手动编辑使用记录
  - [ ] 并发状态更新

## 数据库 Schema 更新

```sql
-- 确保 usage_records 表有正确的字段
ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- 添加索引优化查询
CREATE INDEX IF NOT EXISTS idx_usage_records_quilt_status
ON usage_records(quilt_id, status)
WHERE end_date IS NULL;

-- 添加约束：一个被子同时只能有一条活动记录
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_quilt
ON usage_records(quilt_id)
WHERE end_date IS NULL;
```

## API 接口设计

### POST /api/quilts/[id]/status

**Request:**

```json
{
  "newStatus": "IN_USE",
  "startDate": "2025-01-15", // 可选，改为 IN_USE 时使用
  "endDate": "2025-01-20", // 可选，从 IN_USE 改为其他时使用
  "notes": "开始使用" // 可选
}
```

**Response:**

```json
{
  "success": true,
  "quilt": {
    "id": "...",
    "currentStatus": "IN_USE",
    ...
  },
  "usageRecord": {
    "id": "...",
    "quiltId": "...",
    "startDate": "2025-01-15",
    "endDate": null,
    "status": "ACTIVE",
    ...
  }
}
```

## 组件状态管理

### StatusChangeDialog State

```typescript
interface StatusChangeDialogState {
  newStatus: string;
  startDate: Date; // 改为 IN_USE 时使用
  endDate: Date; // 从 IN_USE 改为其他时使用
  notes: string;
  loading: boolean;
}
```

## 实现优先级

1. **高优先级**: Phase 1 (数据库和 API) - 核心逻辑
2. **高优先级**: Phase 2.4-2.5 (UI 组件) - 用户交互
3. **中优先级**: Phase 2.6 (手动编辑) - 灵活性
4. **中优先级**: Phase 3 (验证和测试) - 稳定性

## 注意事项

1. **数据一致性**: 确保状态转换的原子性
2. **时区处理**: 统一使用 UTC 或本地时区
3. **历史记录**: 不要删除或覆盖历史使用记录
4. **错误处理**: 优雅处理网络错误和数据冲突
5. **用户反馈**: 清晰的成功/错误消息

## 下一步

1. 实现数据库操作函数
2. 创建智能状态更新 API
3. 增强 StatusChangeDialog 组件
4. 测试完整流程

---

**创建日期**: 2025-01-15
**状态**: 待实现
**预计工作量**: 4-6 小时
