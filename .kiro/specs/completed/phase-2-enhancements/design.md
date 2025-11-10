# 设计文档

## 概述

本文档描述了被子管理系统（QMS）第二阶段功能增强的技术设计方案。基于需求文档中定义的12个核心需求，本设计涵盖了UI/UX优化、智能功能增强、数据管理改进和多终端支持等方面的技术实现方案。

## 架构概览

### 技术栈

- **前端框架**: Next.js 16.0.0 (React 19.2.0)
- **状态管理**: Zustand + React Query (TanStack Query)
- **API层**: tRPC
- **数据库**: Neon Serverless PostgreSQL
- **样式**: Tailwind CSS 4
- **UI组件**: Radix UI + shadcn/ui
- **图表库**: Recharts (待集成)
- **PWA**: next-pwa (待集成)

### 系统分层

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
│  - Pages, Components, Layouts       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     Application Layer (Logic)       │
│  - Hooks, State Management          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     API Layer (tRPC)                │
│  - Routers, Procedures              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     Data Layer (Database)           │
│  - Repositories, Models             │
└─────────────────────────────────────┘
```

## 组件设计

### 1. UI布局优化

#### 1.1 被子列表页面优化

**文件**: `src/app/quilts/page.tsx`

**变更**:

- 移除批量操作按钮（保留批量操作功能，通过其他入口触发）
- 修改表头样式：`font-bold text-center`
- 在Grid视图的QuiltCard中添加图片显示

**实现细节**:

```typescript
// 表头样式更新
<th className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider">
  {t('quilts.table.itemNumber')}
</th>

// Grid视图卡片添加图片
<div className="aspect-square w-full bg-gray-100 rounded-t-lg overflow-hidden">
  {quilt.imageUrl ? (
    <img src={quilt.imageUrl} alt={quilt.name} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-12 h-12 text-gray-400" />
    </div>
  )}
</div>
```

#### 1.2 版本信息展示优化

**文件**: `src/components/layout/AppLayout.tsx`

**变更**:

- 从 `package.json` 动态读取版本号
- 移除硬编码的日期显示
- 添加 GitHub 和 Vercel 图标链接

**实现细节**:

```typescript
// 读取版本号
import packageJson from '../../../package.json';

// 版本信息组件
<div className="flex-shrink-0 border-t border-gray-200 p-4">
  <div className="flex items-center justify-center gap-3">
    <span className="text-xs text-gray-400">v{packageJson.version}</span>
    <a
      href="https://github.com/your-repo/qms"
      target="_blank"
      className="text-gray-400 hover:text-gray-600"
    >
      <Github className="w-4 h-4" />
    </a>
    <a
      href="https://vercel.com/your-project"
      target="_blank"
      className="text-gray-400 hover:text-gray-600"
    >
      <svg>...</svg> {/* Vercel icon */}
    </a>
  </div>
</div>
```

### 2. 被子附加图片管理

#### 2.1 数据模型扩展

**数据库迁移**:

```sql
-- 添加图片字段（Base64编码存储）
ALTER TABLE quilts
  ADD COLUMN main_image TEXT,           -- 主图片（Base64）
  ADD COLUMN attachment_images TEXT[];  -- 附加图片数组（Base64）

-- 添加索引（可选，如果需要按图片存在性查询）
CREATE INDEX idx_quilts_has_image ON quilts((main_image IS NOT NULL));
```

**存储说明**：

- 图片以Base64编码存储在数据库中
- 单张图片压缩后约100-200KB
- 适合小规模使用（几十到几百张图片）
- 优点：简单、跨平台、无需额外存储服务

#### 2.2 图片上传组件

**文件**: `src/components/quilts/ImageUpload.tsx`

**功能**:

- 支持多图片上传
- 图片预览
- 拖拽排序
- 删除图片

**存储方案**:

- 图片以Base64编码存储在数据库中
- 前端压缩后再上传，减少存储空间
- 跨平台兼容（Vercel、Docker、自托管）

**实现细节**:

```typescript
interface ImageUploadProps {
  images: string[];  // Base64字符串数组
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

// 图片处理工具
async function compressAndEncodeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // 限制最大尺寸（如800x600）
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 压缩质量80%，转换为Base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 上传流程
1. 用户选择图片
2. 前端压缩和转换为Base64
3. 预览
4. 保存Base64字符串到数据库
```

### 3. 智能换被建议

#### 3.1 天气API集成

**API选择**:

- 继续使用 Open-Meteo API（现有方案）
- 免费，无需API key
- 支持7天预报

**文件**: `src/app/api/weather/route.ts`（扩展现有API）

**功能**:

```typescript
interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
}

// 扩展现有API，添加7天预报
export async function GET() {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${SHANGHAI_LAT}&longitude=${SHANGHAI_LON}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&forecast_days=7` +
      `&timezone=Asia/Shanghai`,
    { next: { revalidate: 3600 } } // 缓存1小时
  );

  // 返回当前天气 + 7天预报
}
```

#### 3.2 推荐算法

**文件**: `src/lib/quilt-recommendation.ts`

**逻辑**:

```typescript
function recommendQuilt(forecast: WeatherForecast[], quilts: Quilt[]) {
  const avgTemp = calculateAverageTemp(forecast);

  if (avgTemp > 25) {
    return quilts.filter(q => q.season === 'SUMMER');
  } else if (avgTemp >= 15 && avgTemp <= 25) {
    return quilts.filter(q => q.season === 'SPRING_AUTUMN');
  } else {
    return quilts.filter(q => q.season === 'WINTER');
  }
}
```

#### 3.3 UI展示

**文件**: `src/components/dashboard/QuiltRecommendation.tsx`

**位置**: 仪表板顶部卡片

**内容**:

- 未来7天温度趋势
- 推荐的被子列表
- 推荐理由

### 4. Excel模板导入功能完善

#### 4.1 模板生成

**文件**: `src/lib/excel-template.ts`

**功能**:

```typescript
function generateExcelTemplate() {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['编号', '名称', '季节', '长度(cm)', '宽度(cm)', '重量(g)', '填充材料', '颜色', '位置'],
    ['示例：1', '示例被子', 'WINTER', '200', '150', '2000', '羽绒', '白色', '主卧'],
    // 说明行
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, '被子数据');
  return workbook;
}
```

#### 4.2 数据验证

**文件**: `src/lib/excel-validator.ts`

**验证规则**:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

function validateExcelData(data: any[]): ValidationResult {
  const errors = [];

  data.forEach((row, index) => {
    // 必填字段检查
    if (!row.name) {
      errors.push({ row: index + 2, field: '名称', message: '必填' });
    }

    // 数据类型检查
    if (isNaN(row.weightGrams)) {
      errors.push({ row: index + 2, field: '重量', message: '必须是数字' });
    }

    // 枚举值检查
    if (!['WINTER', 'SUMMER', 'SPRING_AUTUMN'].includes(row.season)) {
      errors.push({ row: index + 2, field: '季节', message: '无效的季节值' });
    }
  });

  return { valid: errors.length === 0, errors };
}
```

#### 4.3 导入预览

**文件**: `src/components/import/ImportPreview.tsx`

**功能**:

- 显示解析后的数据表格
- 高亮显示错误行
- 允许用户修正数据
- 确认后批量导入

### 5. 被子使用频率统计与淘汰建议

#### 5.1 统计算法

**文件**: `src/lib/usage-statistics.ts`

**功能**:

```typescript
interface UsageStats {
  quiltId: string;
  quiltName: string;
  usage30Days: number;
  usage90Days: number;
  usage365Days: number;
  lastUsedDate: Date | null;
  recommendation: 'active' | 'low_usage' | 'retire';
}

async function calculateUsageStats(quilts: Quilt[]): Promise<UsageStats[]> {
  const now = new Date();
  const stats = [];

  for (const quilt of quilts) {
    const usageRecords = await getUsageRecords(quilt.id);

    const usage30 = usageRecords.filter(r => daysBetween(r.startDate, now) <= 30).length;

    const usage90 = usageRecords.filter(r => daysBetween(r.startDate, now) <= 90).length;

    const usage365 = usageRecords.filter(r => daysBetween(r.startDate, now) <= 365).length;

    let recommendation = 'active';
    if (usage365 === 0) {
      recommendation = 'retire';
    } else if (usage365 < 3) {
      recommendation = 'low_usage';
    }

    stats.push({
      quiltId: quilt.id,
      quiltName: quilt.name,
      usage30Days: usage30,
      usage90Days: usage90,
      usage365Days: usage365,
      lastUsedDate: usageRecords[0]?.startDate || null,
      recommendation,
    });
  }

  return stats.sort((a, b) => b.usage365Days - a.usage365Days);
}
```

#### 5.2 UI展示

**文件**: `src/app/analytics/page.tsx`

**新增标签页**: "使用频率分析"

**内容**:

- 使用频率排行榜（表格）
- 淘汰建议列表
- 筛选器（显示全部/低使用率/建议淘汰）

### 6. 多终端PWA支持

#### 6.1 PWA配置

**安装依赖**:

```bash
npm install next-pwa
```

**文件**: `next.config.js`

**配置**:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // 现有配置
});
```

#### 6.2 Manifest文件

**文件**: `public/manifest.json`

**内容**:

```json
{
  "name": "QMS - 被子管理系统",
  "short_name": "QMS",
  "description": "家庭被子管理系统",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 6.3 Service Worker策略

**缓存策略**:

- 静态资源（CSS, JS, 图片）: Cache First
- API请求: Network First
- 页面: Network First with Cache Fallback

### 7. 通知系统增强

#### 7.1 通知生成规则

**文件**: `src/lib/notification-generator.ts`

**规则引擎**:

```typescript
interface NotificationRule {
  id: string;
  type: 'weather_change' | 'maintenance_reminder' | 'retire_suggestion';
  priority: 'high' | 'medium' | 'low';
  condition: () => Promise<boolean>;
  generate: () => Promise<Notification>;
}

const rules: NotificationRule[] = [
  {
    id: 'weather-change',
    type: 'weather_change',
    priority: 'high',
    condition: async () => {
      const forecast = await getWeatherForecast();
      return Math.abs(forecast[0].temp - forecast[1].temp) > 5;
    },
    generate: async () => ({
      title: '温度变化提醒',
      message: '明天温度将有较大变化，建议更换被子',
      action: '/quilts',
    }),
  },
  // 其他规则...
];
```

#### 7.2 通知生成（实时检查）

**文件**: `src/lib/notification-checker.ts`

**实现**:

- 用户打开应用时实时检查通知规则
- 生成的通知存储到数据库
- 无需后台定时任务，跨平台兼容

**检查时机**:

```typescript
// 在应用布局中检查
// src/components/layout/AppLayout.tsx

useEffect(() => {
  // 每次打开应用时检查
  checkAndGenerateNotifications();

  // 或者每小时检查一次（如果应用一直开着）
  const interval = setInterval(
    () => {
      checkAndGenerateNotifications();
    },
    60 * 60 * 1000
  ); // 1小时

  return () => clearInterval(interval);
}, []);
```

**优点**:

- 无需配置定时任务
- Vercel、Docker、自托管都支持
- 简单可靠

### 8. 搜索与筛选功能增强

#### 8.1 高级筛选面板

**文件**: `src/components/quilts/AdvancedFilters.tsx`

**筛选条件**:

```typescript
interface FilterCriteria {
  seasons?: Season[];
  statuses?: Status[];
  weightRange?: { min: number; max: number };
  sizeRange?: {
    lengthMin: number;
    lengthMax: number;
    widthMin: number;
    widthMax: number;
  };
  colors?: string[];
  materials?: string[];
}
```

**UI设计**:

- 使用 Popover 或 Sheet 组件
- 分组显示筛选条件
- 实时预览筛选结果数量
- 保存筛选条件到 localStorage

#### 8.2 搜索高亮

**实现**:

```typescript
function highlightSearchTerm(text: string, searchTerm: string) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}
```

### 9. 数据可视化增强

#### 9.1 图表库集成

**安装依赖**:

```bash
npm install recharts
```

**文件**: `src/app/analytics/page.tsx`

#### 9.2 图表类型

**1. 使用频率柱状图**

```typescript
<BarChart data={usageFrequencyData}>
  <XAxis dataKey="quiltName" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="usageCount" fill="#3b82f6" />
</BarChart>
```

**2. 季节性使用趋势折线图**

```typescript
<LineChart data={seasonalTrendData}>
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="winter" stroke="#3b82f6" />
  <Line type="monotone" dataKey="summer" stroke="#f59e0b" />
  <Line type="monotone" dataKey="springAutumn" stroke="#10b981" />
</LineChart>
```

**3. 被子状态分布饼图**

```typescript
<PieChart>
  <Pie
    data={statusDistributionData}
    dataKey="count"
    nameKey="status"
    cx="50%"
    cy="50%"
    outerRadius={80}
    label
  >
    {statusDistributionData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

**4. 温度与被子类型关联热力图**

```typescript
// 使用自定义组件或第三方库
<HeatMap
  data={temperatureQuiltData}
  xAxis="temperature"
  yAxis="quiltType"
  value="usageCount"
/>
```

#### 9.3 数据聚合

**文件**: `src/lib/analytics-data.ts`

**功能**:

```typescript
async function aggregateUsageData(timeRange: '30d' | '90d' | '365d' | 'all') {
  // 从数据库聚合数据
  // 按时间范围筛选
  // 返回图表所需格式
}
```

#### 9.4 交互功能

- 悬停显示详细信息
- 点击图表元素钻取到详情
- 导出图表为PNG（使用 html2canvas）

### 10. 页面交互联动优化

#### 10.1 仪表板双击跳转

**文件**: `src/app/page.tsx`

**实现**:

```typescript
// 正在使用列表
<div
  onDoubleClick={() => router.push(`/quilts/${quilt.id}`)}
  className="cursor-pointer hover:bg-blue-50"
>
  {/* 被子信息 */}
</div>

// 历史使用列表
<div
  onDoubleClick={() => router.push(`/quilts/${record.quiltId}`)}
  className="cursor-pointer hover:bg-blue-50"
>
  {/* 使用记录 */}
</div>
```

#### 10.2 使用追踪页面双击行为

**文件**: `src/app/usage/page.tsx`

**配置选项**:

```typescript
type UsageRecordDoubleClickAction = 'edit_record' | 'view_quilt_detail' | 'end_usage' | 'none';
```

**实现**:

```typescript
const handleRowDoubleClick = (record: UsageRecord) => {
  const action = appSettings?.usageRecordDoubleClickAction || 'edit_record';

  switch (action) {
    case 'edit_record':
      openEditDialog(record);
      break;
    case 'view_quilt_detail':
      router.push(`/quilts/${record.quiltId}`);
      break;
    case 'end_usage':
      handleEndUsage(record);
      break;
    case 'none':
    default:
      break;
  }
};
```

#### 10.3 设置页面配置

**文件**: `src/app/settings/page.tsx`

**新增配置项**:

```typescript
<Select
  value={usageRecordDoubleClickAction}
  onValueChange={handleUsageRecordActionChange}
>
  <SelectItem value="edit_record">编辑记录</SelectItem>
  <SelectItem value="view_quilt_detail">查看被子详情</SelectItem>
  <SelectItem value="end_usage">结束使用</SelectItem>
  <SelectItem value="none">无操作</SelectItem>
</Select>
```

#### 10.4 视觉反馈

**实现**:

```typescript
// 双击时的动画效果
<motion.div
  whileTap={{ scale: 0.98 }}
  onDoubleClick={handleDoubleClick}
  className="transition-colors duration-150"
>
  {/* 内容 */}
</motion.div>
```

### 11. 设置页面UI优化

#### 11.1 两栏布局

**文件**: `src/app/settings/page.tsx`

**布局结构**:

```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 左侧栏 - 配置项 (2/3宽度) */}
  <div className="lg:col-span-2 space-y-6">
    <Card>{/* 语言设置 */}</Card>
    <Card>{/* 交互行为设置 */}</Card>
    <Card>{/* 安全设置 */}</Card>
  </div>

  {/* 右侧栏 - 系统信息 (1/3宽度) */}
  <div className="space-y-6">
    <Card>{/* 数据库连接状态 */}</Card>
    <Card>{/* 系统信息 */}</Card>
  </div>
</div>
```

#### 11.2 系统信息卡片优化

**实现**:

```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center space-x-2">
      <Info className="w-5 h-5" />
      <span>系统信息</span>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">版本</span>
      <Badge variant="outline">{version}</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">框架</span>
      <Badge variant="outline">Next.js {frameworkVersion}</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">部署</span>
      <Badge className="bg-black text-white">Vercel</Badge>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">环境</span>
      <Badge variant={env === 'production' ? 'default' : 'secondary'}>
        {env}
      </Badge>
    </div>
  </CardContent>
</Card>
```

#### 11.3 数据库连接状态

**简化显示**:

```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center space-x-2">
      <Database className="w-5 h-5" />
      <span>数据库</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">{connected ? '已连接' : '未连接'}</span>
    </div>
    <p className="text-xs text-gray-500 mt-2">
      {dbProvider}
    </p>
  </CardContent>
</Card>
```

#### 11.4 默认语言设置

**文件**: `src/lib/language-storage.ts`

**修改默认值**:

```typescript
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'; // 默认中文

  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && (stored === 'zh' || stored === 'en')) {
    return stored as Language;
  }

  return 'zh'; // 默认中文，而不是浏览器语言
}
```

#### 11.5 响应式适配

**移动端布局**:

```typescript
// 在小屏幕上自动切换为单栏
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 移动端：垂直堆叠 */}
  {/* 桌面端：2:1 两栏布局 */}
</div>
```

## 数据模型

### 扩展的Quilt模型

```typescript
interface Quilt {
  // 现有字段
  id: string;
  itemNumber: number;
  name: string;
  season: Season;
  lengthCm: number;
  widthCm: number;
  weightGrams: number;
  fillMaterial: string;
  color: string;
  location: string;
  currentStatus: Status;

  // 新增字段
  mainImage?: string; // 主图片（Base64编码）
  attachmentImages?: string[]; // 附加图片数组（Base64编码）
  createdAt: Date;
  updatedAt: Date;
}
```

### 新增的Notification模型

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'weather_change' | 'maintenance_reminder' | 'retire_suggestion';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}
```

### 扩展的AppSettings模型

```typescript
interface AppSettings {
  id: string;
  userId: string;

  // 现有设置
  doubleClickAction: 'none' | 'status' | 'edit';

  // 新增设置
  usageRecordDoubleClickAction: 'edit_record' | 'view_quilt_detail' | 'end_usage' | 'none';
  defaultLanguage: 'zh' | 'en';

  // 筛选条件保存
  savedFilters?: FilterCriteria;

  updatedAt: Date;
}
```

## API设计

### tRPC路由扩展

#### 1. 天气相关

```typescript
// src/server/api/routers/weather.ts
export const weatherRouter = createTRPCRouter({
  getForecast: publicProcedure
    .input(z.object({ location: z.string() }))
    .query(async ({ input }) => {
      return await getWeatherForecast(input.location);
    }),

  getQuiltRecommendation: publicProcedure.query(async ({ ctx }) => {
    const forecast = await getWeatherForecast();
    const quilts = await ctx.db.quilt.findMany();
    return recommendQuilt(forecast, quilts);
  }),
});
```

#### 2. 图片管理

```typescript
// src/server/api/routers/quilt.ts (扩展现有路由)
export const quiltRouter = createTRPCRouter({
  // 现有方法...

  updateImages: protectedProcedure
    .input(
      z.object({
        quiltId: z.string(),
        mainImage: z.string().optional(),
        attachmentImages: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quilt.update({
        where: { id: input.quiltId },
        data: {
          mainImage: input.mainImage,
          attachmentImages: input.attachmentImages,
        },
      });
    }),

  deleteImage: protectedProcedure
    .input(
      z.object({
        quiltId: z.string(),
        imageIndex: z.number(), // 删除附加图片数组中的某个
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quilt = await ctx.db.quilt.findUnique({
        where: { id: input.quiltId },
      });

      if (quilt?.attachmentImages) {
        const newImages = [...quilt.attachmentImages];
        newImages.splice(input.imageIndex, 1);

        return await ctx.db.quilt.update({
          where: { id: input.quiltId },
          data: { attachmentImages: newImages },
        });
      }
    }),
});
```

#### 3. 统计分析

```typescript
// src/server/api/routers/analytics.ts
export const analyticsRouter = createTRPCRouter({
  getUsageFrequency: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(['30d', '90d', '365d', 'all']),
      })
    )
    .query(async ({ ctx, input }) => {
      return await calculateUsageStats(input.timeRange);
    }),

  getSeasonalTrend: protectedProcedure.query(async ({ ctx }) => {
    return await getSeasonalUsageTrend();
  }),

  getStatusDistribution: protectedProcedure.query(async ({ ctx }) => {
    return await getQuiltStatusDistribution();
  }),
});
```

#### 4. 通知管理

```typescript
// src/server/api/routers/notification.ts
export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.notification.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.notification.delete({
        where: { id: input.id },
      });
    }),
});
```

## 错误处理

### 统一错误处理策略

```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export const errorMessages = {
  WEATHER_API_ERROR: '天气服务暂时不可用',
  UPLOAD_FAILED: '图片上传失败',
  INVALID_EXCEL_FORMAT: 'Excel文件格式不正确',
  NOTIFICATION_GENERATION_FAILED: '通知生成失败',
};
```

### 前端错误处理

```typescript
// 在组件中
try {
  await mutation.mutateAsync(data);
  toast.success('操作成功');
} catch (error) {
  if (error instanceof AppError) {
    toast.error(error.message);
  } else {
    toast.error('操作失败，请重试');
  }
  console.error(error);
}
```

## 测试策略

### 单元测试

**工具**: Jest + React Testing Library

**测试范围**:

- 工具函数（统计算法、推荐算法、数据验证）
- React Hooks
- 数据转换函数

**示例**:

```typescript
// src/lib/__tests__/usage-statistics.test.ts
describe('calculateUsageStats', () => {
  it('should correctly calculate usage frequency', async () => {
    const mockQuilts = [...];
    const stats = await calculateUsageStats(mockQuilts);

    expect(stats[0].usage365Days).toBe(10);
    expect(stats[0].recommendation).toBe('active');
  });

  it('should recommend retirement for unused quilts', async () => {
    const mockQuilts = [...];
    const stats = await calculateUsageStats(mockQuilts);

    const unusedQuilt = stats.find(s => s.usage365Days === 0);
    expect(unusedQuilt?.recommendation).toBe('retire');
  });
});
```

### 集成测试

**测试范围**:

- API路由
- 数据库操作
- 外部服务集成（天气API）

### E2E测试（可选）

**工具**: Playwright

**关键流程**:

- 用户登录 → 查看仪表板 → 双击跳转详情
- 上传Excel → 预览 → 导入
- 查看统计图表 → 导出图片

## 性能优化

### 1. 图片优化

- 前端上传前压缩（限制尺寸800x600，质量80%）
- Base64存储，直接在img标签中使用
- 懒加载（使用loading="lazy"属性）
- 限制单张图片大小（建议<200KB）

### 2. 数据缓存

```typescript
// React Query 缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
    },
  },
});

// 天气数据缓存（1小时）
export const useWeatherForecast = () => {
  return useQuery({
    queryKey: ['weather', 'forecast'],
    queryFn: getWeatherForecast,
    staleTime: 60 * 60 * 1000,
  });
};
```

### 3. 代码分割

```typescript
// 动态导入大型组件
const AnalyticsCharts = dynamic(() => import('@/components/analytics/Charts'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false,
});
```

### 4. 虚拟滚动

对于大量数据的列表，使用 `@tanstack/react-virtual`：

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: quilts.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

## 安全考虑

### 1. 图片上传安全

- 文件类型验证（仅允许JPEG、PNG、WebP）
- 文件大小限制（原始文件<5MB，压缩后<200KB）
- Base64长度验证
- 前端压缩和验证

### 2. API安全

- 所有修改操作需要身份验证
- 速率限制
- 输入验证和清理

### 3. XSS防护

- 使用 React 的自动转义
- 对用户输入进行清理
- CSP (Content Security Policy) 配置

## 部署考虑

### 环境变量

```env
# 天气API - Open-Meteo（无需API key，免费）
# 无需额外配置

# 图片存储 - 数据库Base64存储
# 无需额外配置

# 现有环境变量
DATABASE_URL=...
NEXTAUTH_SECRET=...
```

**注意**: 不需要Vercel特定的配置，所有功能都是跨平台的

### 数据库迁移

**迁移脚本**:

```sql
-- 1. 添加附加图片字段
ALTER TABLE quilts ADD COLUMN attachment_images TEXT[] DEFAULT '{}';

-- 2. 创建通知表
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 3. 扩展应用设置表
ALTER TABLE app_settings
  ADD COLUMN usage_record_double_click_action VARCHAR(50) DEFAULT 'edit_record',
  ADD COLUMN default_language VARCHAR(10) DEFAULT 'zh',
  ADD COLUMN saved_filters JSONB;

-- 注意：图片字段使用TEXT类型存储Base64编码
-- 单张压缩后的图片约100-200KB
-- PostgreSQL TEXT类型可存储最大1GB数据，完全够用
```

## 实施计划

### Phase 2.1 - 快速改进（1-2天）

**Day 1**:

- [ ] UI布局优化（移除批量操作按钮、表头样式、卡片图片）
- [ ] 版本信息展示优化（读取package.json、添加图标链接）
- [ ] 设置页面UI优化（两栏布局、移除统计数据）
- [ ] 默认语言设置为中文

**Day 2**:

- [ ] 页面交互联动优化（仪表板双击、使用追踪双击）
- [ ] 搜索与筛选功能增强（高级筛选面板、搜索高亮）

### Phase 2.2 - 核心功能（2-3天）

**Day 3**:

- [ ] 智能换被建议（天气API集成、推荐算法、UI展示）
- [ ] 被子使用频率统计（统计算法、排行榜UI）

**Day 4**:

- [ ] 被子附加图片管理（数据模型扩展、上传组件、图片展示）
- [ ] Excel模板导入完善（模板生成、数据验证、预览界面）

**Day 5**:

- [ ] 通知系统增强（通知规则、调度任务、UI展示）

### Phase 2.3 - 高级功能（1-2天）

**Day 6**:

- [ ] 数据可视化增强（图表库集成、4种图表实现、交互功能）

**Day 7**:

- [ ] 多终端PWA支持（PWA配置、Manifest、Service Worker）
- [ ] 测试和bug修复

## 技术债务和未来改进

### 短期改进

- 添加图片压缩和优化
- 实现更智能的推荐算法（基于历史使用数据）
- 添加更多图表类型

### 中期改进

- 实现离线编辑和同步（如果PWA使用频繁）
- 添加数据导出功能增强
- 实现OCR标签识别（可选需求）

### 长期改进

- 多用户支持和权限管理
- 移动端原生应用
- AI驱动的智能建议

## 附录

### A. 依赖包清单

**新增依赖**:

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "next-pwa": "^5.6.0",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

**注意**：图片处理使用浏览器原生API（Canvas、FileReader），无需额外依赖

### B. 文件结构

```
src/
├── app/
│   ├── analytics/
│   │   └── page.tsx (增强)
│   ├── quilts/
│   │   └── page.tsx (优化)
│   ├── settings/
│   │   └── page.tsx (重构)
│   └── usage/
│       └── page.tsx (优化)
├── components/
│   ├── analytics/
│   │   ├── Charts.tsx (新增)
│   │   └── UsageFrequencyTable.tsx (新增)
│   ├── quilts/
│   │   ├── ImageUpload.tsx (新增)
│   │   └── AdvancedFilters.tsx (新增)
│   ├── dashboard/
│   │   └── QuiltRecommendation.tsx (新增)
│   └── import/
│       └── ImportPreview.tsx (增强)
├── lib/
│   ├── weather-service.ts (新增)
│   ├── quilt-recommendation.ts (新增)
│   ├── usage-statistics.ts (新增)
│   ├── notification-checker.ts (新增)
│   ├── excel-template.ts (新增)
│   └── excel-validator.ts (新增)
└── server/
    └── api/
        └── routers/
            ├── weather.ts (新增)
            ├── upload.ts (新增)
            ├── analytics.ts (新增)
            └── notification.ts (新增)
```

### C. 参考资料

- [Next.js PWA文档](https://github.com/shadowwalker/next-pwa)
- [Recharts文档](https://recharts.org/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [FileReader API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [tRPC文档](https://trpc.io/)

---

**文档版本**: 1.0  
**最后更新**: 2025-11-06  
**作者**: Kiro AI Assistant
