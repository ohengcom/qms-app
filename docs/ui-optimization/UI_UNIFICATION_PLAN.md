# UI 统一改造计划

## 目标

将所有页面统一使用 Shadcn UI 组件，确保视觉风格一致、代码可维护性更好。

## 已完成 ✅

### 1. 仪表板 (src/app/page.tsx)

- ✅ Tabs 组件替换自定义按钮标签
- ✅ 统计卡片使用 Shadcn Card 组件
- ✅ 移除自定义渐变和阴影
- ✅ 统一颜色系统

## 待改造页面

### 2. 被子管理页面 (src/app/quilts/page.tsx) 🔄

**需要改造的组件：**

- [ ] 表格头部渐变背景 → 使用 Shadcn Table 组件
- [ ] 自定义卡片样式 → 统一使用 Card 组件
- [ ] 筛选器样式 → 使用 Shadcn Select/Input 组件
- [ ] 按钮样式 → 统一使用 Button 组件

**优先级：高** - 这是最常用的页面

### 3. 使用记录页面 (src/app/usage/page.tsx) 🔄

**需要改造的组件：**

- [ ] 表格头部渐变背景 → 使用 Shadcn Table 组件
- [ ] 排序按钮 → 使用 Button 组件
- [ ] 状态徽章 → 使用 Badge 组件
- [ ] 对话框 → 使用 Dialog 组件

**优先级：高**

### 4. 数据分析页面 (src/app/analytics/page.tsx) ✅

**当前状态：** 已经使用 Shadcn 组件，只需微调

- ✅ Tabs 组件
- ✅ Card 组件
- ✅ Select 组件
- [ ] 进度条可以改用 Progress 组件

**优先级：低**

### 5. 设置页面 (src/app/settings/page.tsx) 🔄

**需要改造的组件：**

- [ ] 表单输入 → 使用 Shadcn Form 组件
- [ ] 按钮 → 统一使用 Button 组件
- [ ] 卡片 → 统一使用 Card 组件
- [ ] 开关 → 使用 Switch 组件

**优先级：中**

### 6. 登录页面 (src/app/login/page.tsx) ✅

**当前状态：** 已经使用 Shadcn 组件

- ✅ Card 组件
- ✅ Input 组件
- ✅ Button 组件

**优先级：低** - 已完成

## 组件统一规范

### 颜色系统

```typescript
// 使用 Tailwind 的语义化颜色
- primary: 主色调
- secondary: 次要色调
- muted: 柔和色调
- accent: 强调色调
- destructive: 危险/删除操作

// 避免使用
- 自定义渐变 (bg-gradient-to-*)
- 硬编码颜色 (bg-blue-500)
```

### 卡片组件

```tsx
// ✅ 推荐
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
</Card>

// ❌ 避免
<div className="bg-white rounded-lg shadow-lg p-6">
  ...
</div>
```

### 按钮组件

```tsx
// ✅ 推荐
<Button variant="default">主要按钮</Button>
<Button variant="outline">次要按钮</Button>
<Button variant="ghost">文本按钮</Button>
<Button variant="destructive">删除按钮</Button>

// ❌ 避免
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  按钮
</button>
```

### 表格组件

```tsx
// ✅ 推荐
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>列名</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>内容</TableCell>
    </TableRow>
  </TableBody>
</Table>

// ❌ 避免
<table className="w-full">
  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
    ...
  </thead>
</table>
```

### 标签页组件

```tsx
// ✅ 推荐
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">标签1</TabsTrigger>
    <TabsTrigger value="tab2">标签2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容1</TabsContent>
  <TabsContent value="tab2">内容2</TabsContent>
</Tabs>

// ❌ 避免
<div className="flex border-b">
  <button className="px-4 py-2 border-b-2">标签1</button>
</div>
```

## 实施步骤

### 第一阶段：核心页面（本周）

1. ✅ 仪表板 - 已完成
2. 被子管理页面
3. 使用记录页面

### 第二阶段：次要页面（下周）

4. 设置页面
5. 数据分析页面微调

### 第三阶段：组件库完善

6. 创建自定义 Shadcn 组件变体
7. 统一动画效果
8. 优化响应式布局

## 预期效果

### 视觉一致性

- 所有页面使用相同的设计语言
- 统一的颜色、间距、圆角、阴影
- 更专业的外观

### 代码质量

- 减少自定义 CSS
- 更好的可维护性
- 更容易添加新功能

### 用户体验

- 更流畅的交互
- 更好的可访问性
- 更快的加载速度

### 开发效率

- 复用 Shadcn 组件
- 减少样式调试时间
- 更容易的主题切换

## 注意事项

1. **保持动画效果** - 不要移除现有的 Framer Motion 动画
2. **响应式设计** - 确保所有改造后的组件在移动端正常工作
3. **渐进式改造** - 一次改造一个页面，避免大规模破坏
4. **测试验证** - 每次改造后进行功能测试
5. **性能优化** - 确保改造不影响页面性能

## 参考资源

- [Shadcn UI 文档](https://ui.shadcn.com/)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

---

**创建时间**: 2025-11-10  
**状态**: 进行中  
**完成度**: 20%
