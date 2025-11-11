# 使用记录页面 Shadcn UI 改造计划

## 当前状态分析

**文件**: `src/app/usage/page.tsx` (550 行)

### 需要改造的部分

1. **统计卡片** (第 258-295 行)
   - ❌ 使用自定义样式: `bg-white border border-gray-200 rounded-lg`
   - ✅ 改为: Shadcn `Card` 组件

2. **表格** (第 298-450 行)
   - ❌ 表头渐变: `bg-gradient-to-r from-gray-50 to-gray-100`
   - ❌ 自定义表格样式
   - ✅ 改为: Shadcn `Table` 组件

3. **按钮**
   - ✅ 已使用 Shadcn `Button` 组件

4. **状态徽章**
   - ❌ 使用自定义样式
   - ✅ 改为: Shadcn `Badge` 组件

## 改造步骤

### 第一步: 统计卡片改造

```tsx
// ❌ 旧代码
<div className="bg-white border border-gray-200 rounded-lg p-4">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <BarChart3 className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
      <p className="text-xs text-gray-500">{t('usage.stats.totalRecords')}</p>
    </div>
  </div>
</div>

// ✅ 新代码
<Card>
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <BarChart3 className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{stats.total}</p>
        <p className="text-xs text-muted-foreground">{t('usage.stats.totalRecords')}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### 第二步: 表格改造

```tsx
// ❌ 旧代码
<table className="w-full">
  <thead>
    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        ...
      </th>
    </tr>
  </thead>
</table>

// ✅ 新代码
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="cursor-pointer hover:bg-muted/80" onClick={...}>
        ...
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>...</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 第三步: 状态徽章改造

```tsx
// ❌ 旧代码
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  {t('usage.status.active')}
</span>

// ✅ 新代码
<Badge variant="default">
  {t('usage.status.active')}
</Badge>
```

## 预期效果

- ✅ 视觉风格与被子管理页面一致
- ✅ 代码更简洁易维护
- ✅ 使用语义化颜色系统
- ✅ 保持所有现有功能

## 实施时间

预计 1-2 小时
