# 被子管理页面重构计划

## 📊 当前状态

- **文件大小**: 1007 行
- **ESLint 问题**: 37 个警告/错误
- **主要问题**:
  - 单文件过大
  - 大量 `any` 类型
  - 混合的样式系统
  - 逻辑和 UI 耦合

## 🎯 重构目标

1. **拆分组件** - 每个文件不超过 300 行
2. **添加类型** - 移除所有 `any` 类型
3. **统一样式** - 使用 Shadcn UI 组件
4. **提高可维护性** - 清晰的职责分离

## 📁 新的文件结构

```
src/app/quilts/
├── page.tsx (主页面，150 行)
│   └── 负责：布局、状态管理、数据获取
│
└── components/
    ├── QuiltListView.tsx (表格视图，200 行)
    │   └── 负责：表格渲染、排序
    │
    ├── QuiltGridView.tsx (网格视图，150 行)
    │   └── 负责：卡片网格渲染
    │
    ├── QuiltTableRow.tsx (表格行，100 行)
    │   └── 负责：单行渲染、操作按钮
    │
    ├── QuiltCard.tsx (卡片，100 行)
    │   └── 负责：单个卡片渲染
    │
    ├── QuiltToolbar.tsx (工具栏，150 行)
    │   └── 负责：搜索、筛选、视图切换
    │
    └── QuiltBatchActions.tsx (批量操作，100 行)
        └── 负责：批量选择、批量删除

src/types/
└── quilt.ts (类型定义，50 行)
    └── 所有 Quilt 相关的类型定义
```

## 🔧 重构步骤

### 第 1 步：创建类型定义 ✅

创建 `src/types/quilt.ts`：

```typescript
export type Season = 'WINTER' | 'SPRING_AUTUMN' | 'SUMMER';
export type QuiltStatus = 'AVAILABLE' | 'IN_USE' | 'STORAGE' | 'MAINTENANCE';

export interface Quilt {
  id: string;
  itemNumber: number;
  name: string;
  season: Season;
  size: string;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  location: string;
  currentStatus: QuiltStatus;
  brand?: string;
  purchaseDate?: string;
  mainImage?: string | null;
  attachmentImages?: string[] | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCriteria {
  seasons: Season[];
  statuses: QuiltStatus[];
  colors: string[];
  materials: string[];
  locations?: string[];
  brands?: string[];
  minWeight?: number;
  maxWeight?: number;
}

export type SortField =
  | 'itemNumber'
  | 'name'
  | 'season'
  | 'size'
  | 'weight'
  | 'fillMaterial'
  | 'color'
  | 'location'
  | 'currentStatus';

export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'list' | 'grid';
```

### 第 2 步：提取工具栏组件

创建 `src/app/quilts/components/QuiltToolbar.tsx`：

```typescript
interface QuiltToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isSelectMode: boolean;
  onSelectModeToggle: () => void;
  selectedCount: number;
  onBatchDelete: () => void;
  onAddQuilt: () => void;
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  availableColors: string[];
  availableMaterials: string[];
}
```

### 第 3 步：提取表格视图组件

创建 `src/app/quilts/components/QuiltListView.tsx`：

```typescript
interface QuiltListViewProps {
  quilts: Quilt[];
  searchTerm: string;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (quilt: Quilt) => void;
  onDelete: (quilt: Quilt) => void;
  onStatusChange: (quilt: Quilt) => void;
  onViewHistory: (quilt: Quilt) => void;
}
```

### 第 4 步：提取网格视图组件

创建 `src/app/quilts/components/QuiltGridView.tsx`：

```typescript
interface QuiltGridViewProps {
  quilts: Quilt[];
  searchTerm: string;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onEdit: (quilt: Quilt) => void;
  onDelete: (quilt: Quilt) => void;
  onStatusChange: (quilt: Quilt) => void;
}
```

### 第 5 步：提取表格行组件

创建 `src/app/quilts/components/QuiltTableRow.tsx`：

```typescript
interface QuiltTableRowProps {
  quilt: Quilt;
  searchTerm: string;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelectToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  onViewHistory: () => void;
}
```

### 第 6 步：提取卡片组件

创建 `src/app/quilts/components/QuiltCard.tsx`：

```typescript
interface QuiltCardProps {
  quilt: Quilt;
  searchTerm: string;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelectToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}
```

### 第 7 步：简化主页面

`src/app/quilts/page.tsx` 只保留：

```typescript
export default function QuiltsPage() {
  // 1. 状态管理 (50 行)
  // 2. 数据获取 (20 行)
  // 3. 事件处理器 (50 行)
  // 4. 渲染 (30 行)

  return (
    <div>
      <QuiltToolbar {...toolbarProps} />
      {viewMode === 'list' ? (
        <QuiltListView {...listProps} />
      ) : (
        <QuiltGridView {...gridProps} />
      )}
      <QuiltDialog {...dialogProps} />
      <StatusChangeDialog {...statusProps} />
    </div>
  );
}
```

## 🎨 统一样式（重构后）

### 使用 Shadcn UI 组件

```typescript
// ✅ 表格
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

// ✅ 卡片
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// ✅ 按钮
import { Button } from '@/components/ui/button';

// ✅ 输入框
import { Input } from '@/components/ui/input';

// ✅ 徽章
import { Badge } from '@/components/ui/badge';
```

### 移除自定义样式

```typescript
// ❌ 移除
className = 'bg-gradient-to-r from-gray-50 to-gray-100';
className = 'text-xs font-bold text-gray-500 uppercase';

// ✅ 使用
className = 'bg-muted/50';
className = 'text-muted-foreground';
```

## 📝 实施时间表

### 第 1 天：类型和基础组件

- [ ] 创建类型定义文件
- [ ] 创建 QuiltCard 组件
- [ ] 创建 QuiltTableRow 组件
- [ ] 测试基础组件

### 第 2 天：视图组件

- [ ] 创建 QuiltListView 组件
- [ ] 创建 QuiltGridView 组件
- [ ] 集成 Shadcn Table 组件
- [ ] 测试视图切换

### 第 3 天：工具栏和主页面

- [ ] 创建 QuiltToolbar 组件
- [ ] 重构主页面
- [ ] 修复所有 ESLint 警告
- [ ] 完整测试

### 第 4 天：优化和文档

- [ ] 性能优化
- [ ] 添加注释
- [ ] 更新文档
- [ ] 最终测试

## ✅ 成功标准

### 代码质量

- [ ] 无 ESLint 错误
- [ ] 无 TypeScript 错误
- [ ] 无 `any` 类型
- [ ] 每个文件 < 300 行

### 功能完整性

- [ ] 所有现有功能正常工作
- [ ] 搜索和筛选正常
- [ ] 排序功能正常
- [ ] 批量操作正常
- [ ] 视图切换正常

### UI 一致性

- [ ] 使用 Shadcn UI 组件
- [ ] 统一的颜色系统
- [ ] 统一的间距和圆角
- [ ] 响应式设计

### 性能

- [ ] 加载速度不变或更快
- [ ] 无内存泄漏
- [ ] 流畅的动画

## 🔍 测试清单

### 功能测试

- [ ] 添加被子
- [ ] 编辑被子
- [ ] 删除被子
- [ ] 搜索被子
- [ ] 筛选被子
- [ ] 排序被子
- [ ] 批量删除
- [ ] 视图切换
- [ ] 状态变更
- [ ] 查看历史

### 边界测试

- [ ] 空列表
- [ ] 大量数据 (1000+ 条)
- [ ] 长文本
- [ ] 特殊字符
- [ ] 网络错误

### 响应式测试

- [ ] 桌面 (1920x1080)
- [ ] 平板 (768x1024)
- [ ] 手机 (375x667)

## 📚 参考资源

- [React 组件拆分最佳实践](https://react.dev/learn/thinking-in-react)
- [TypeScript 类型定义](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Shadcn UI 组件](https://ui.shadcn.com/docs/components)

---

**创建时间**: 2025-11-10  
**预计完成**: 2025-11-14  
**负责人**: AI Assistant  
**状态**: 📋 计划中
