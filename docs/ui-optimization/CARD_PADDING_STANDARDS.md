# 卡片内边距规范

## 📏 统一标准

### 1. 统计卡片（小卡片）

**用途**: 显示单个统计数据

```tsx
<Card>
  <CardContent className="p-4">{/* 统计内容 */}</CardContent>
</Card>
```

**内边距**: `p-4` (16px)

---

### 2. 内容卡片（中等卡片）

**用途**: 显示一般内容，有标题和内容区域

```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>{/* 内容 - 使用默认 p-6 */}</CardContent>
</Card>
```

**内边距**:

- CardHeader: 默认 `p-6`
- CardContent: 默认 `p-6`

---

### 3. 表单卡片（大卡片）

**用途**: 包含表单字段的卡片

```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">{/* 表单字段 */}</CardContent>
</Card>
```

**内边距**:

- CardHeader: 默认 `p-6`
- CardContent: 默认 `p-6` + `space-y-4` 用于字段间距

---

### 4. 紧凑卡片

**用途**: 空间有限时使用

```tsx
<Card>
  <CardContent className="p-3">{/* 紧凑内容 */}</CardContent>
</Card>
```

**内边距**: `p-3` (12px)

---

## 🎯 应用规则

### 何时使用 p-4

- ✅ 统计卡片
- ✅ 小型信息卡片
- ✅ 仪表板统计

### 何时使用默认 p-6

- ✅ 有标题的内容卡片
- ✅ 表单卡片
- ✅ 详情页面卡片

### 何时使用 p-3

- ✅ 移动端紧凑布局
- ✅ 侧边栏卡片
- ✅ 嵌套卡片

---

## 📊 当前使用情况

### 仪表板 (src/app/page.tsx)

- ✅ 统计卡片: `p-4` - 正确

### 使用记录 (src/app/usage/page.tsx)

- ✅ 统计卡片: `p-4` - 正确

### 数据分析 (src/app/analytics/page.tsx)

- ✅ 统计卡片: `pt-6` - 需要统一为 `p-4`

### 设置 (src/app/settings/page.tsx)

- ✅ 内容卡片: 默认 - 正确

---

## 🔧 需要修改的地方

### 数据分析页面

```tsx
// ❌ 当前
<Card>
  <CardContent className="pt-6">
    ...
  </CardContent>
</Card>

// ✅ 应该改为
<Card>
  <CardContent className="p-4">
    ...
  </CardContent>
</Card>
```

---

**创建时间**: 2025-11-11  
**状态**: 已制定
