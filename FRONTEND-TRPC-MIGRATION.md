# 前端 tRPC 迁移指南

## 问题

部署 Session 3 后，前端出现错误：
- ❌ "Failed to fetch quilts: 404"
- ❌ "No usage records"

## 原因

前端代码仍在使用旧的 REST API 端点（`/api/quilts`, `/api/usage`），但这些端点已在 Session 3 中删除并替换为 tRPC API。

## 修复

### 1. 更新 useQuilts Hook

**文件**: `src/hooks/useQuilts.ts`

#### 之前（REST API）:
```typescript
export function useQuilts(searchParams?: QuiltSearchInput) {
  return useQuery({
    queryKey: ['quilts'],
    queryFn: async () => {
      const response = await fetch('/api/quilts');
      if (!response.ok) {
        throw new Error(`Failed to fetch quilts: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 60000,
  });
}
```

#### 之后（tRPC）:
```typescript
import { api } from '@/lib/trpc';

export function useQuilts(searchParams?: QuiltSearchInput) {
  return api.quilts.getAll.useQuery(searchParams, {
    staleTime: 60000,
  });
}
```

### 2. 所有更新的 Hooks

| Hook | 之前 | 之后 |
|------|------|------|
| `useQuilts()` | `fetch('/api/quilts')` | `api.quilts.getAll.useQuery()` |
| `useQuilt(id)` | `fetch('/api/quilts/${id}')` | `api.quilts.getById.useQuery({ id })` |
| `useCreateQuilt()` | `fetch('/api/quilts', POST)` | `api.quilts.create.useMutation()` |
| `useUpdateQuilt()` | `fetch('/api/quilts/${id}', PUT)` | `api.quilts.update.useMutation()` |
| `useDeleteQuilt()` | `fetch('/api/quilts/${id}', DELETE)` | `api.quilts.delete.useMutation()` |
| `useStartUsage()` | `fetch('/api/usage/start', POST)` | `api.usage.create.useMutation()` |
| `useEndUsage()` | `fetch('/api/usage/end', POST)` | `api.usage.end.useMutation()` |

### 3. 缓存失效更新

#### 之前:
```typescript
export function useCreateQuilt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => { /* ... */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
    },
  });
}
```

#### 之后:
```typescript
export function useCreateQuilt() {
  const queryClient = useQueryClient();
  const utils = api.useUtils();
  
  return api.quilts.create.useMutation({
    onSuccess: () => {
      utils.quilts.getAll.invalidate();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

### 4. 更新 Proxy 保护路径

**文件**: `src/proxy.ts`

#### 之前:
```typescript
const protectedApiPaths = [
  '/api/quilts',    // 已删除
  '/api/usage',     // 已删除
  '/api/import',
  '/api/export',
  '/api/analytics',
  '/api/reports',
  '/api/trpc',
];
```

#### 之后:
```typescript
const protectedApiPaths = [
  '/api/trpc',      // tRPC endpoints (quilts, usage, etc.)
  '/api/import',
  '/api/export',
  '/api/analytics',
  '/api/reports',
  '/api/dashboard',
  '/api/admin',
];
```

## 优势

### 1. 类型安全
```typescript
// 自动类型推断
const { data } = api.quilts.getAll.useQuery({
  season: 'WINTER',  // ✓ 类型检查
  limit: 20,
});

// data 的类型自动推断
data?.quilts.forEach(quilt => {
  console.log(quilt.name); // ✓ 自动补全
});
```

### 2. 更好的错误处理
```typescript
const { data, error, isLoading } = api.quilts.getAll.useQuery();

if (error) {
  // error 有完整的类型信息
  console.error(error.message);
}
```

### 3. 自动重试和缓存
```typescript
// tRPC 自动处理
// - 请求重试
// - 缓存管理
// - 乐观更新
// - 后台重新验证
```

### 4. 更少的代码
```typescript
// 之前: ~20 行代码
export function useQuilts() {
  return useQuery({
    queryKey: ['quilts'],
    queryFn: async () => {
      const response = await fetch('/api/quilts');
      if (!response.ok) {
        throw new Error(`Failed to fetch quilts: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 60000,
  });
}

// 之后: ~3 行代码
export function useQuilts(searchParams) {
  return api.quilts.getAll.useQuery(searchParams, {
    staleTime: 60000,
  });
}
```

## 迁移检查清单

- [x] 更新 `useQuilts` hook
- [x] 更新 `useQuilt` hook
- [x] 更新 `useCreateQuilt` hook
- [x] 更新 `useUpdateQuilt` hook
- [x] 更新 `useDeleteQuilt` hook
- [x] 更新 `useStartUsage` hook
- [x] 更新 `useEndUsage` hook
- [x] 更新 proxy 保护路径
- [x] 测试所有功能
- [x] 部署到生产环境

## 测试

### 本地测试
```bash
npm run dev
```

访问:
1. `/quilts` - 应该显示被子列表
2. `/usage` - 应该显示使用记录
3. 创建/编辑/删除被子 - 应该正常工作

### 生产测试
1. 等待 Vercel 部署完成
2. 清除浏览器缓存或使用 Incognito 模式
3. 测试所有 CRUD 操作

## 故障排除

### 问题: 仍然看到 404 错误
**解决方案**: 
1. 清除浏览器缓存
2. 硬刷新 (Ctrl+Shift+R)
3. 访问 `/clear-cache.html?clear=true`

### 问题: TypeScript 错误
**解决方案**:
1. 确保 `@trpc/react-query` 已安装
2. 重启 TypeScript 服务器
3. 检查 `src/lib/trpc.ts` 配置

### 问题: 数据不更新
**解决方案**:
1. 检查缓存失效逻辑
2. 使用 `utils.quilts.getAll.invalidate()`
3. 检查 React Query DevTools

## 相关文件

- `src/hooks/useQuilts.ts` - Quilts hooks
- `src/lib/trpc.ts` - tRPC 客户端配置
- `src/server/api/routers/quilts.ts` - Quilts tRPC router
- `src/server/api/routers/usage.ts` - Usage tRPC router
- `src/server/api/root.ts` - Root router
- `src/proxy.ts` - 认证 proxy

## 下一步

所有前端代码现在使用 tRPC API：
- ✅ 类型安全
- ✅ 自动补全
- ✅ 更好的错误处理
- ✅ 更少的代码
- ✅ 更好的开发体验

---

**更新时间**: 2025-11-03  
**状态**: ✅ 已修复并部署
