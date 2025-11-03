# 使用记录表迁移指南

## 概述

本次重构将 `current_usage` 和 `usage_periods` 两个表合并为一个统一的 `usage_records` 表。

## 为什么要重构？

### 旧设计的问题

- **两个表**: `current_usage`（活动记录）+ `usage_periods`（历史记录）
- **数据重复**: 同一条记录需要在两个表之间移动
- **查询复杂**: 需要 UNION 两个表才能看到完整数据
- **容易出错**: 移动数据时可能丢失信息

### 新设计的优势

- **一个表**: `usage_records` 统一管理所有记录
- **简单查询**: `WHERE end_date IS NULL` 查询活动记录
- **简单更新**: 只需 UPDATE end_date 字段
- **数据完整**: 不需要在表之间移动数据

## 新表结构

```sql
CREATE TABLE usage_records (
  id TEXT PRIMARY KEY,
  quilt_id TEXT NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,              -- NULL = 活动中
  usage_type TEXT DEFAULT 'REGULAR',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_usage_records_quilt_id ON usage_records(quilt_id);
CREATE INDEX idx_usage_records_dates ON usage_records(start_date, end_date);
CREATE INDEX idx_usage_records_active ON usage_records(quilt_id) WHERE end_date IS NULL;

-- 唯一约束：每个被子只能有一条活动记录
CREATE UNIQUE INDEX idx_one_active_per_quilt ON usage_records(quilt_id) WHERE end_date IS NULL;
```

## 迁移步骤

### 步骤 1: 运行迁移脚本

```bash
npm run migrate-usage-tables
```

这个脚本会：

1. 创建新的 `usage_records` 表
2. 创建所有必要的索引和约束
3. 从 `current_usage` 迁移活动记录
4. 从 `usage_periods` 迁移历史记录
5. 验证数据完整性
6. 显示迁移统计

### 步骤 2: 验证数据

迁移完成后，检查：

- 总记录数是否正确
- 活动记录数是否正确
- 完成记录数是否正确
- 没有重复的活动记录

### 步骤 3: 测试功能

在生产环境测试以下功能：

- ✅ 查看使用记录列表
- ✅ 查看单个被子的使用历史
- ✅ 开始使用被子（状态改为"使用中"）
- ✅ 结束使用被子（状态从"使用中"改为其他）
- ✅ 仪表板统计数据
- ✅ 分析报表

### 步骤 4: 删除旧表（可选）

**⚠️ 警告**: 只有在确认一切正常后才执行此步骤！

```bash
npm run drop-old-usage-tables
```

这会永久删除 `current_usage` 和 `usage_periods` 表。

## 回滚计划

如果迁移出现问题，可以：

1. **保留旧表**: 迁移脚本不会删除旧表，所以数据仍然安全
2. **恢复代码**: 回滚到之前的 Git commit
3. **删除新表**:
   ```sql
   DROP TABLE IF EXISTS usage_records CASCADE;
   ```

## 代码变更

### 数据库函数 (src/lib/neon.ts)

```typescript
// 创建使用记录 - 简化了！
async createUsageRecord(quiltId, startDate, notes) {
  await sql`
    INSERT INTO usage_records (quilt_id, start_date, end_date, notes)
    VALUES (${quiltId}, ${startDate}, NULL, ${notes})
  `;
}

// 结束使用记录 - 只需 UPDATE！
async endUsageRecord(quiltId, endDate, notes) {
  await sql`
    UPDATE usage_records
    SET end_date = ${endDate}, notes = COALESCE(${notes}, notes)
    WHERE quilt_id = ${quiltId} AND end_date IS NULL
  `;
}

// 查询活动记录 - 简单查询！
async getActiveUsageRecord(quiltId) {
  return await sql`
    SELECT * FROM usage_records
    WHERE quilt_id = ${quiltId} AND end_date IS NULL
  `;
}

// 查询所有记录 - 一个表搞定！
async getUsageRecordsByQuiltId(quiltId) {
  return await sql`
    SELECT * FROM usage_records
    WHERE quilt_id = ${quiltId}
    ORDER BY start_date DESC
  `;
}
```

### API 端点

所有 API 端点都已更新为使用新表：

- `/api/usage` - 获取所有使用记录
- `/api/usage/[quiltId]` - 获取特定被子的使用记录
- `/api/usage/end` - 结束使用记录
- `/api/quilts/[id]/status` - 状态变更（自动管理使用记录）

## 性能优化

新设计的性能优势：

- ✅ 减少了 50% 的表数量
- ✅ 查询速度提升（不需要 UNION）
- ✅ 更新操作更快（UPDATE vs INSERT + DELETE）
- ✅ 索引更高效（部分索引 WHERE end_date IS NULL）

## 常见问题

### Q: 迁移会影响现有数据吗？

A: 不会。迁移脚本会复制数据到新表，旧表保持不变。

### Q: 迁移需要多长时间？

A: 取决于数据量。通常几秒钟内完成。

### Q: 如果迁移失败怎么办？

A: 旧表仍然存在，可以安全回滚代码。

### Q: 什么时候删除旧表？

A: 在生产环境运行至少一周，确认一切正常后再删除。

## 联系支持

如有问题，请查看：

- GitHub Issues
- 项目文档
- 开发团队

---

**迁移日期**: 2025-01-16  
**版本**: v0.3.0  
**状态**: 准备就绪
