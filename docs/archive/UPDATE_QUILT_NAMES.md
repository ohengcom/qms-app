# 更新被子名称指南

## 概述

已创建工具来更新数据库中现有被子的名称，使其符合新的命名规则：
**格式：品牌 + 颜色 + 重量 + 克 + 季节 + 被**

例如：`百思寒褐色1100克春秋被`

## 方法 1：通过 API 端点（推荐）

等待 Vercel 部署完成后，使用以下命令：

### Windows PowerShell:

```powershell
Invoke-WebRequest -Uri "https://qms-app-omega.vercel.app/api/admin/update-quilt-names" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content
```

### macOS/Linux:

```bash
curl -X POST https://qms-app-omega.vercel.app/api/admin/update-quilt-names
```

### 或者在浏览器中：

1. 打开浏览器开发者工具（F12）
2. 进入 Console 标签
3. 运行以下代码：

```javascript
fetch('https://qms-app-omega.vercel.app/api/admin/update-quilt-names', {
  method: 'POST',
})
  .then(r => r.json())
  .then(data => console.table(data.updates));
```

## 方法 2：通过脚本（需要数据库连接）

如果你有直接的数据库访问权限：

```bash
DATABASE_URL="your-neon-connection-string" npm run update-quilt-names
```

## 预期结果

脚本会：

1. 读取所有现有被子记录
2. 根据每个被子的品牌、颜色、重量和季节生成新名称
3. 更新数据库中的名称字段
4. 返回更新摘要，包括：
   - 更新的被子数量
   - 跳过的被子数量（名称已经正确）
   - 每个被子的详细更新信息

## 示例输出

```json
{
  "success": true,
  "total": 16,
  "updated": 14,
  "skipped": 2,
  "updates": [
    {
      "itemNumber": 1,
      "oldName": "Winter Quilt 1",
      "newName": "百思寒褐色1100克冬被",
      "status": "updated"
    },
    ...
  ]
}
```

## 注意事项

- 此操作会修改数据库中的数据
- 建议在非高峰时段运行
- 操作是幂等的，可以安���地多次运行
- 如果名称已经正确，会自动跳过

## 验证

更新完成后，访问被子列表页面验证名称是否正确更新：
https://qms-app-omega.vercel.app/quilts
