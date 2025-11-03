# tRPC Mutation 参数修复指南

## 问题总结

在将前端从 REST API 迁移到 tRPC 后，遇到了两个 TypeScript 编译错误。

## 错误 1: Delete Mutation

### 错误信息

```
Type error: Argument of type 'string' is not assignable to parameter of type '{ id: string; }'
```

### 原因

tRPC mutations 期望对象参数，而不是直接的原始值。

### 修复

**之前（错误）**:

```typescript
await deleteQuilt.mutateAsync(quilt.id);
```

**之后（正确）**:

```typescript
await deleteQuilt.mutateAsync({ id: quilt.id });
```

### 修改的文件

- `src/app/quilts/page.tsx` - 2 处
- `src/components/quilts/QuiltCard.tsx` - 1 处
- `src/components/quilts/QuiltDetail.tsx` - 1 处

## 错误 2: Update Mutation

### 错误信息

```
Type error: Object literal may only specify known properties, and 'data' does not exist in type '{ id: string; name?: string; ... }'
```

### 原因

`updateQuiltSchema` 期望扁平化的输入（id + 所有字段），而不是嵌套的 `{ id, data }` 结构。

### Schema 定义

```typescript
// src/lib/validations/quilt.ts
export const updateQuiltSchema = baseQuiltSchemaObject.partial().extend({
  id: z.string().min(1, 'Quilt ID is required'),
});

// 期望的输入格式：
// { id: string, name?: string, season?: Season, ... }
```

### 修复

**之前（错误）**:

```typescript
await updateQuilt.mutateAsync({
  id: quilt.id,
  data: { name: 'New Name', season: 'WINTER' },
});
```

**之后（正确）**:

```typescript
await updateQuilt.mutateAsync({
  id: quilt.id,
  name: 'New Name',
  season: 'WINTER',
});

// 或使用展开运算符
await updateQuilt.mutateAsync({
  id: quilt.id,
  ...data,
});
```

### 修改的文件

- `src/app/quilts/page.tsx` - 2 处
- `src/components/quilts/QuiltForm.tsx` - 1 处

## tRPC Mutation 参数模式

### 1. Delete Mutation

```typescript
// Schema
input: z.object({ id: z.string() });

// 使用
deleteQuilt.mutateAsync({ id: 'quilt-123' });
```

### 2. Create Mutation

```typescript
// Schema
input: createQuiltSchema;

// 使用
createQuilt.mutateAsync({
  name: 'Winter Quilt',
  season: 'WINTER',
  // ... 其他字段
});
```

### 3. Update Mutation

```typescript
// Schema
input: updateQuiltSchema; // { id: string, ...partial fields }

// 使用
updateQuilt.mutateAsync({
  id: 'quilt-123',
  name: 'Updated Name',
  season: 'SPRING_AUTUMN',
  // ... 其他要更新的字段
});
```

## 最佳实践

### 1. 使用展开运算符

```typescript
const data = {
  name: 'New Name',
  season: 'WINTER',
  color: 'Blue',
};

// ✅ 好的做法
await updateQuilt.mutateAsync({ id: quilt.id, ...data });

// ❌ 错误的做法
await updateQuilt.mutateAsync({ id: quilt.id, data });
```

### 2. 类型安全

```typescript
// tRPC 提供完整的类型推断
const { mutateAsync } = api.quilts.update.useMutation();

// TypeScript 会自动检查参数类型
await mutateAsync({
  id: 'quilt-123',
  season: 'INVALID', // ❌ TypeScript 错误
});

await mutateAsync({
  id: 'quilt-123',
  season: 'WINTER', // ✅ 正确
});
```

### 3. 部分更新

```typescript
// updateQuiltSchema 使用 .partial()
// 所以你只需要传递要更新的字段

await updateQuilt.mutateAsync({
  id: 'quilt-123',
  name: 'New Name', // 只更新名称
});

await updateQuilt.mutateAsync({
  id: 'quilt-123',
  season: 'WINTER', // 只更新季节
  color: 'Blue', // 和颜色
});
```

## 验证清单

- [x] Delete mutation 使用 `{ id }` 对象
- [x] Update mutation 使用扁平化参数 `{ id, ...fields }`
- [x] Create mutation 直接传递数据对象
- [x] 所有 TypeScript 错误已修复
- [x] 代码已推送到 GitHub
- [x] Vercel 部署成功

## 测试

### 本地测试

```bash
npm run build
```

应该没有 TypeScript 错误。

### 功能测试

1. **删除被子**:
   - 单个删除
   - 批量删除
2. **更新被子**:
   - 编辑被子信息
   - 更新被子状态
3. **创建被子**:
   - 添加新被子

## 相关文件

- `src/hooks/useQuilts.ts` - Quilts hooks 定义
- `src/lib/validations/quilt.ts` - Schema 定义
- `src/server/api/routers/quilts.ts` - tRPC router
- `src/app/quilts/page.tsx` - Quilts 页面
- `src/components/quilts/QuiltForm.tsx` - Quilt 表单
- `src/components/quilts/QuiltCard.tsx` - Quilt 卡片
- `src/components/quilts/QuiltDetail.tsx` - Quilt 详情

## 总结

tRPC mutations 的关键点：

1. ✅ 总是传递对象参数
2. ✅ Update 使用扁平化参数（不嵌套 data）
3. ✅ 利用 TypeScript 类型检查
4. ✅ 使用展开运算符简化代码

---

**更新时间**: 2025-11-03  
**状态**: ✅ 所有错误已修复，部署成功
