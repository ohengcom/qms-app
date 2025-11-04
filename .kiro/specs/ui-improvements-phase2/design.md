# Design Document

## Overview

本设计文档详细描述了QMS家庭被子管理系统第二阶段UI改进的技术实现方案。改进涉及6个主要模块的UI优化和功能增强，包括整体框架、仪表面板、被子管理、数据分析、导入导出和系统设置。

## Architecture

### Component Structure

```
src/
├── app/
│   ├── layout.tsx                    # 更新：移除语言选择器
│   ├── page.tsx                      # 更新：仪表面板优化
│   ├── login/page.tsx                # 更新：登录框居中
│   ├── quilts/page.tsx               # 更新：双击行为、表格优化
│   ├── analytics/page.tsx            # 更新：页面标题、图表优化
│   ├── reports/page.tsx              # 重构：改为导入导出页面
│   └── settings/page.tsx             # 更新：添加双击行为配置
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx             # 更新：标题和语言选择器
│   ├── quilts/
│   │   ├── QuiltForm.tsx             # 更新：默认值、数字输入
│   │   └── StatusChangeDialog.tsx    # 更新：状态变更逻辑
│   ├── import/                       # 新增：导入组件
│   │   ├── ImportUpload.tsx
│   │   ├── ImportPreview.tsx
│   │   └── ImportResults.tsx
│   └── export/                       # 新增：导出组件
│       ├── ExportOptions.tsx
│       └── ExportHistory.tsx
├── lib/
│   ├── i18n.ts                       # 更新：新增翻译键
│   └── validations/
│       └── quilt.ts                  # 更新：默认值验证
└── server/
    └── api/
        └── routers/
            ├── quilts.ts             # 更新：状态变更逻辑
            ├── usage.ts              # 更新：自动创建使用记录
            └── import.ts             # 新增：导入路由
```

## Components and Interfaces

### 1. 整体框架组件

#### AppLayout.tsx 更新

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}

// 更新内容：
// 1. 左上角标题改为"QMS家庭被子管理系统"
// 2. 移除右上角LanguageSwitcher组件
// 3. 保留其他功能不变
```

#### layout.tsx 更新

```typescript
// 更新metadata中的title
export const metadata: Metadata = {
  title: 'QMS - 家庭被子管理系统',
  description: '家庭被子库存和使用追踪系统',
  // ... 其他配置保持不变
};
```

#### login/page.tsx 更新

```typescript
// 更新登录框样式，使用flex居中布局
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
  <Card className="w-full max-w-md shadow-lg">
    {/* 登录表单内容 */}
  </Card>
</div>
```

### 2. 仪表面板组件

#### page.tsx (Dashboard) 更新

```typescript
// 更新内容：
// 1. 页面标题改为"仪表面板"
<h1 className="text-2xl font-semibold text-gray-900">仪表面板</h1>

// 2. 移除副标题
// 删除：<p className="text-sm text-gray-500 mt-1">被子管理系统 管理您的被子收藏和使用情况</p>

// 3. 日期和天气同行显示，增大字体
<div className="flex items-center gap-6 text-base">
  <div className="flex items-center gap-2">
    <Calendar className="w-5 h-5" />
    <span>{dateStr}</span>
  </div>
  {weather && (
    <div className="flex items-center gap-2">
      <Cloud className="w-5 h-5" />
      <span>{weather.location.city}</span>
      <span className="text-xl">{weather.current.weather.icon}</span>
      <span className="font-semibold">{weather.current.temperature}°C</span>
    </div>
  )}
</div>

// 4. 当前在用被子列表 - 单行紧凑显示
<div className="flex items-center justify-between py-3">
  <div className="flex items-center gap-3">
    <Package className="w-5 h-5 text-success" />
    <span className="font-medium">{quilt.name}</span>
    <span className="text-sm text-muted-foreground">#{quilt.itemNumber}</span>
    <Badge>{t(`season.${quilt.season}`)}</Badge>
    <span className="text-sm text-muted-foreground">
      {quilt.fillMaterial} · {quilt.weightGrams}g · {quilt.location}
    </span>
  </div>
  <Link href={`/quilts?search=${quilt.name}`}>查看详情</Link>
</div>

// 5. 往年今日使用被子列表 - 单行紧凑显示
<div className="flex items-center justify-between py-3">
  <div className="flex items-center gap-3">
    <span className="font-semibold text-accent-foreground">{record.year}</span>
    <span className="font-medium">{record.quiltName}</span>
    <span className="text-sm text-muted-foreground">#{record.itemNumber}</span>
    <Badge>{t(`season.${record.season}`)}</Badge>
    <span className="text-sm text-muted-foreground">
      {formatDate(record.startDate)} → {record.endDate ? formatDate(record.endDate) : '使用中'}
    </span>
  </div>
</div>
```

### 3. 被子管理组件

#### quilts/page.tsx 更新

```typescript
// 新增状态管理
const [doubleClickAction, setDoubleClickAction] = useState<'none' | 'status' | 'edit'>('status');

// 从设置中加载双击行为配置
useEffect(() => {
  const loadSettings = async () => {
    const settings = await trpc.settings.getAppSettings.query();
    setDoubleClickAction(settings.doubleClickAction || 'status');
  };
  loadSettings();
}, []);

// 双击行为处理
const handleRowDoubleClick = (quilt: any) => {
  switch (doubleClickAction) {
    case 'status':
      handleChangeStatus(quilt);
      break;
    case 'edit':
      handleEditQuilt(quilt);
      break;
    case 'none':
    default:
      // 不执行任何操作
      break;
  }
};

// 表格行添加双击事件
<tr
  key={quilt.id}
  onDoubleClick={() => handleRowDoubleClick(quilt)}
  className="cursor-pointer hover:bg-blue-50"
>
  {/* 表格内容 */}
</tr>
```

#### QuiltForm.tsx 更新

```typescript
// 更新默认值
const form = useForm<CreateQuiltInput>({
  resolver: zodResolver(createQuiltSchema),
  defaultValues: initialData || {
    itemNumber: 0,
    name: '',
    season: Season.SPRING_AUTUMN,
    lengthCm: 200,
    widthCm: 180,
    weightGrams: 1000,
    fillMaterial: '',
    color: '',
    brand: '无品牌',              // 新增默认值
    location: '未存储',            // 新增默认值
    currentStatus: QuiltStatus.STORAGE,
  },
});

// 重量字段标签更新
<FormLabel>重量 (g) *</FormLabel>

// 数字输入框更新 - 整数步进
<Input
  type="number"
  step="1"                        // 确保步进为1
  min="0"
  placeholder="e.g., 1500"
  {...field}
  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
/>
```

#### StatusChangeDialog.tsx 更新

```typescript
// 状态变更处理
const handleStatusChange = async (newStatus: QuiltStatus) => {
  try {
    // 1. 更新被子状态
    await updateQuiltMutation.mutateAsync({
      id: quilt.id,
      currentStatus: newStatus,
      location: newStatus === 'IN_USE' ? '在用' : quilt.location, // 自动更新位置
    });

    // 2. 如果状态改为使用中，创建使用记录
    if (newStatus === 'IN_USE') {
      await createUsageRecordMutation.mutateAsync({
        quiltId: quilt.id,
        startDate: new Date(),
        usageType: 'REGULAR_USE',
      });
    }

    toast.success('状态更新成功');
    onSuccess?.();
  } catch (error) {
    toast.error('状态更新失败');
  }
};
```

### 4. 数据分析组件

#### analytics/page.tsx 更新

```typescript
// 页面标题更新
<h1 className="text-3xl font-bold text-gray-900 mb-2">数据分析</h1>

// 状态分布图表 - 移除"可用"状态
const statusDistribution = {
  IN_USE: analytics.statusDistribution.IN_USE,
  STORAGE: analytics.statusDistribution.STORAGE,
  MAINTENANCE: analytics.statusDistribution.MAINTENANCE,
  // 移除 AVAILABLE
};

// Most used quilts 列表 - 紧凑布局
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-blue-600 text-white rounded-full font-bold flex items-center justify-center text-sm">
      {index + 1}
    </div>
    <div>
      <span className="font-semibold">{quilt.name}</span>
      <span className="text-sm text-gray-600 ml-2">平均: {quilt.averageDays} 天</span>
    </div>
  </div>
  <div className="text-right">
    <span className="text-xl font-bold text-blue-600">{quilt.usageCount}</span>
    <span className="text-sm text-gray-600 ml-1">次</span>
  </div>
</div>
```

### 5. 导入导出组件

#### reports/page.tsx 重构为 import-export/page.tsx

```typescript
export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">导入导出</h1>
        <p className="text-sm text-gray-500 mt-1">批量导入和导出被子数据</p>
      </div>

      {/* Tab 切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import">导入数据</TabsTrigger>
          <TabsTrigger value="export">导出数据</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ImportSection />
        </TabsContent>

        <TabsContent value="export">
          <ExportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### ImportUpload.tsx (新组件)

```typescript
interface ImportUploadProps {
  onFileSelect: (file: File) => void;
}

export function ImportUpload({ onFileSelect }: ImportUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!validTypes.includes(file.type)) {
        toast.error('请选择有效的Excel文件 (.xls 或 .xlsx)');
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>上传Excel文件</CardTitle>
        <CardDescription>支持 .xls 和 .xlsx 格式</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            拖拽文件到此处或点击选择文件
          </p>
          <Input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="max-w-xs mx-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

#### ExportOptions.tsx (新组件)

```typescript
interface ExportOptionsProps {
  onExport: (format: 'csv' | 'json') => void;
}

export function ExportOptions({ onExport }: ExportOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>导出选项</CardTitle>
        <CardDescription>选择导出格式</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => onExport('csv')}
          className="w-full justify-start"
          variant="outline"
        >
          <FileSpreadsheet className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">导出为 CSV</div>
            <div className="text-xs text-gray-500">
              适用于Excel和其他表格软件
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onExport('json')}
          className="w-full justify-start"
          variant="outline"
        >
          <Database className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">导出为 JSON</div>
            <div className="text-xs text-gray-500">
              适用于数据备份和程序处理
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 6. 系统设置组件

#### settings/page.tsx 更新

```typescript
// 页面标题更新
<h1 className="text-2xl font-bold text-gray-900">系统设置</h1>

// 新增双击行为配置
<Card>
  <CardHeader>
    <CardTitle>被子管理设置</CardTitle>
    <CardDescription>配置被子列表的交互行为</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label>双击行为</Label>
      <Select
        value={doubleClickAction}
        onValueChange={handleDoubleClickActionChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div>
              <div className="font-medium">无动作</div>
              <div className="text-xs text-gray-500">双击不执行任何操作</div>
            </div>
          </SelectItem>
          <SelectItem value="status">
            <div>
              <div className="font-medium">修改状态</div>
              <div className="text-xs text-gray-500">双击打开状态修改对话框</div>
            </div>
          </SelectItem>
          <SelectItem value="edit">
            <div>
              <div className="font-medium">编辑被子</div>
              <div className="text-xs text-gray-500">双击打开编辑表单</div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        设置在被子列表中双击行时的默认行为
      </p>
    </div>
  </CardContent>
</Card>
```

## Data Models

### SystemSettings 扩展

```typescript
interface SystemSettings {
  id: string;
  appName: string;
  language: 'zh' | 'en';
  doubleClickAction: 'none' | 'status' | 'edit'; // 新增字段
  createdAt: Date;
  updatedAt: Date;
}
```

### Quilt 模型更新

```typescript
interface Quilt {
  id: string;
  itemNumber: number;
  name: string;
  season: Season;
  lengthCm: number;
  widthCm: number;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  brand: string; // 默认值: "无品牌"
  location: string; // 默认值: "未存储"，状态为IN_USE时自动改为"在用"
  currentStatus: QuiltStatus;
  // ... 其他字段
}
```

### UsageRecord 自动创建

```typescript
interface UsageRecord {
  id: string;
  quiltId: string;
  startDate: Date;
  endDate: Date | null; // null表示仍在使用中
  usageType: UsageType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 当被子状态改为IN_USE时自动创建
```

## Error Handling

### 1. 导入错误处理

```typescript
// 文件格式验证
if (!validFileTypes.includes(file.type)) {
  throw new Error('不支持的文件格式，请上传 .xls 或 .xlsx 文件');
}

// 文件大小验证
if (file.size > 10 * 1024 * 1024) {
  // 10MB
  throw new Error('文件大小超过限制（最大10MB）');
}

// 数据验证
const validationErrors = validateImportData(data);
if (validationErrors.length > 0) {
  return {
    success: false,
    errors: validationErrors,
    message: '数据验证失败，请检查文件内容',
  };
}
```

### 2. 状态变更错误处理

```typescript
try {
  // 更新被子状态
  await updateQuilt({ id, currentStatus, location });

  // 创建使用记录
  if (currentStatus === 'IN_USE') {
    await createUsageRecord({ quiltId: id, startDate: new Date() });
  }
} catch (error) {
  // 回滚状态变更
  await updateQuilt({ id, currentStatus: originalStatus });
  throw new Error('状态更新失败，已回滚更改');
}
```

### 3. 双击行为错误处理

```typescript
const handleRowDoubleClick = (quilt: any) => {
  try {
    switch (doubleClickAction) {
      case 'status':
        handleChangeStatus(quilt);
        break;
      case 'edit':
        handleEditQuilt(quilt);
        break;
      case 'none':
      default:
        // 不执行任何操作
        break;
    }
  } catch (error) {
    console.error('双击操作失败:', error);
    toast.error('操作失败，请重试');
  }
};
```

## Testing Strategy

### 1. 单元测试

```typescript
// QuiltForm 默认值测试
describe('QuiltForm', () => {
  it('should set default brand to "无品牌"', () => {
    const { getByLabelText } = render(<QuiltForm />);
    const brandInput = getByLabelText('品牌');
    expect(brandInput).toHaveValue('无品牌');
  });

  it('should set default location to "未存储"', () => {
    const { getByLabelText } = render(<QuiltForm />);
    const locationInput = getByLabelText('位置');
    expect(locationInput).toHaveValue('未存储');
  });

  it('should use integer step for number inputs', () => {
    const { getByLabelText } = render(<QuiltForm />);
    const weightInput = getByLabelText('重量 (g)');
    expect(weightInput).toHaveAttribute('step', '1');
  });
});

// 状态变更测试
describe('StatusChangeDialog', () => {
  it('should update location to "在用" when status changes to IN_USE', async () => {
    const mockUpdate = jest.fn();
    const { getByText } = render(
      <StatusChangeDialog quilt={mockQuilt} onUpdate={mockUpdate} />
    );

    fireEvent.click(getByText('使用中'));
    fireEvent.click(getByText('确认'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        currentStatus: 'IN_USE',
        location: '在用'
      });
    });
  });

  it('should create usage record when status changes to IN_USE', async () => {
    const mockCreateUsage = jest.fn();
    // ... 测试逻辑
  });
});
```

### 2. 集成测试

```typescript
// 导入流程测试
describe('Import Flow', () => {
  it('should upload, preview, and import Excel file', async () => {
    const file = new File(['test'], 'quilts.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 上传文件
    const { getByLabelText } = render(<ImportExportPage />);
    const fileInput = getByLabelText('选择文件');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 验证预览
    await waitFor(() => {
      expect(screen.getByText('数据预览')).toBeInTheDocument();
    });

    // 执行导入
    fireEvent.click(screen.getByText('确认导入'));

    await waitFor(() => {
      expect(screen.getByText('导入成功')).toBeInTheDocument();
    });
  });
});

// 双击行为测试
describe('Double Click Behavior', () => {
  it('should open status dialog when double-click action is "status"', async () => {
    // 设置双击行为为"修改状态"
    await updateSettings({ doubleClickAction: 'status' });

    const { getByText } = render(<QuiltsPage />);
    const row = getByText('测试被子').closest('tr');

    fireEvent.doubleClick(row);

    await waitFor(() => {
      expect(screen.getByText('更改状态')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E测试

```typescript
// 完整工作流测试
describe('UI Improvements E2E', () => {
  it('should complete full workflow: add quilt -> change status -> verify usage record', async () => {
    // 1. 添加被子
    await page.goto('/quilts');
    await page.click('text=添加被子');
    await page.fill('input[name="name"]', '测试被子');
    // 验证默认值
    expect(await page.inputValue('input[name="brand"]')).toBe('无品牌');
    expect(await page.inputValue('input[name="location"]')).toBe('未存储');
    await page.click('text=保存');

    // 2. 双击行改变状态
    await page.dblclick('text=测试被子');
    await page.click('text=使用中');
    await page.click('text=确认');

    // 3. 验证位置自动更新
    expect(await page.textContent('td:has-text("在用")')).toBeTruthy();

    // 4. 验证使用记录创建
    await page.goto('/usage');
    expect(await page.textContent('text=测试被子')).toBeTruthy();
  });
});
```

## Performance Considerations

### 1. 列表渲染优化

```typescript
// 使用虚拟滚动优化大列表
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: filteredQuilts.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
  overscan: 5,
});
```

### 2. 导入性能优化

```typescript
// 分批处理大文件导入
const BATCH_SIZE = 100;

async function importQuilts(data: QuiltData[]) {
  const batches = chunk(data, BATCH_SIZE);

  for (const batch of batches) {
    await Promise.all(batch.map(quilt => createQuilt(quilt)));

    // 更新进度
    updateProgress(((batches.indexOf(batch) + 1) / batches.length) * 100);
  }
}
```

### 3. 状态管理优化

```typescript
// 使用乐观更新提升响应速度
const updateQuiltStatus = useMutation({
  mutationFn: data => api.quilts.update(data),
  onMutate: async newData => {
    // 取消正在进行的查询
    await queryClient.cancelQueries(['quilts']);

    // 保存当前数据快照
    const previousQuilts = queryClient.getQueryData(['quilts']);

    // 乐观更新
    queryClient.setQueryData(['quilts'], old => updateQuiltInList(old, newData));

    return { previousQuilts };
  },
  onError: (err, newData, context) => {
    // 回滚到之前的状态
    queryClient.setQueryData(['quilts'], context.previousQuilts);
  },
});
```

## Migration Plan

### 数据库迁移

```sql
-- 添加双击行为配置字段
ALTER TABLE system_settings
ADD COLUMN double_click_action VARCHAR(10) DEFAULT 'status'
CHECK (double_click_action IN ('none', 'status', 'edit'));

-- 更新现有被子的默认值
UPDATE quilts
SET brand = '无品牌'
WHERE brand IS NULL OR brand = '';

UPDATE quilts
SET location = '未存储'
WHERE location IS NULL OR location = '';
```

### 版本更新步骤

1. 更新 package.json 版本号为 0.5.0
2. 运行数据库迁移脚本
3. 部署新版本代码
4. 验证所有功能正常
5. 更新文档和变更日志
