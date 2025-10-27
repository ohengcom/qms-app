# QMS - 被子管理系统 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **生产就绪的家庭床品智能库存管理系统**

一个复杂的Next.js应用程序，将简单的基于Excel的被子跟踪转换为具有季节推荐、使用分析、预测洞察、PWA功能和企业级部署特性的智能库存管理系统。

## 🌟 功能特性

### 📊 **智能仪表板**
- 实时库存概览，状态跟踪
- 季节分布和使用情况分析
- 快速访问过滤器和搜索功能
- 存储位置优化洞察

### 🔍 **高级搜索与过滤**
- 跨姓名、品牌、颜色和备注的多字段搜索
- 按季节、状态、位置、重量范围和材料过滤
- 智能建议和已保存的搜索
- 实时搜索结果

### 🌱 **季节智能**
- 自动季节分类（冬季/春秋/夏季）
- 基于当前季节和天气的智能推荐
- 使用模式分析，实现最佳轮换
- 季节转换提醒和准备提醒

### 📈 **使用分析**
- 详细的使用历史，时间轴可视化
- 使用频率和模式分析
- 下次使用期间的预测洞察
- 基于使用模式的维护调度

### 🗂️ **存储优化**
- 基于可访问性的存储布局建议
- 带包装信息的位置跟踪
- 存储效率分析和优化
- 可视化存储组织工具

### 📱 **现代UI/UX与移动支持**
- 针对桌面、平板和移动设备优化的响应式设计
- 渐进式Web应用（PWA）功能，支持离线使用
- 触摸友好界面，支持手势操作
- 移动优先设计，底部导航栏
- 实时更新和通知
- 通过缓存和虚拟滚动优化性能

### 🔄 **数据管理与导入/导出**
- Excel导入/导出，支持中文
- 批量操作和批处理
- 数据验证和错误处理
- 从现有Excel文件迁移历史数据
- 自动备份和恢复功能

## 🏗️ 应用程序架构

### 🚀 **Next.js生产应用程序**（主要实现）
```
qms-app/                        # 生产就绪的Next.js应用程序
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/               # API路由（健康检查、指标、tRPC）
│   │   ├── quilts/            # 被子管理页面
│   │   ├── dashboard/         # 分析仪表板
│   │   ├── import/            # 数据导入功能
│   │   ├── export/            # 数据导出功能
│   │   ├── seasonal/          # 季节分析
│   │   └── usage/             # 使用跟踪
│   ├── components/            # React组件
│   │   ├── ui/                # 可重用UI组件（Radix UI）
│   │   ├── quilts/            # 被子特定组件
│   │   ├── dashboard/         # 仪表板小部件
│   │   ├── mobile/            # 移动PWA组件
│   │   ├── layout/            # 布局和导航
│   │   ├── import/            # 导入功能
│   │   ├── export/            # 导出功能
│   │   ├── seasonal/          # 季节功能
│   │   └── usage/             # 使用跟踪
│   ├── hooks/                 # 自定义React钩子
│   ├── lib/                   # 实用程序和配置
│   ├── server/                # 服务器端代码
│   │   ├── api/routers/       # tRPC API路由
│   │   └── services/          # 业务逻辑服务
│   └── styles/                # 全局和移动样式
├── src/lib/neon.ts           # Neon Serverless Driver数据库操作
├── monitoring/                # Prometheus、Grafana配置
├── nginx/                     # 反向代理配置
├── scripts/                   # 部署和维护脚本
├── public/                    # PWA资源（清单、服务工作者）
├── Dockerfile                 # 容器配置
├── docker-compose.prod.yml    # 生产Docker设置
├── docker-compose.monitoring.yml # 监控堆栈
├── DEPLOYMENT.md              # 部署指南
├── MONITORING.md              # 监控设置
└── README.md                  # 应用程序文档
```

### 📋 **开发规范**
```
.kiro/specs/enhanced-quilt-management/
├── requirements.md           # EARS兼容需求
├── design.md                # 系统架构和设计
└── tasks.md                 # 实现任务分解
```

### 🗂️ **遗留原型**（仅供参考）
项目包含一些在开发过程中使用的遗留原型实现：
- `frontend/` - Vue.js原型（不再积极维护）
- `backend/` - FastAPI原型（不再积极维护）
- `workers/` - Cloudflare Workers实验（不再积极维护）

**注意**：主应用程序是`qms-app/`中的Next.js实现。遗留原型保留供参考，但不是生产系统的一部分。

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Docker和Docker Compose（用于生产部署）
- PostgreSQL（生产环境）或SQLite（开发环境）

### 🎯 **Next.js应用程序设置**

#### 开发设置
```bash
cd qms-app

# 安装依赖项
npm install

# 设置环境
cp .env.example .env.local
# 编辑.env.local，配置数据库URL

# 设置数据库
npm run db:generate
npm run db:migrate
npm run db:seed

# 启动开发服务器
npm run dev
```

#### 生产部署
```bash
cd qms-app

# 配置生产环境
cp .env.production .env.local
# 编辑生产值

# 使用Docker部署
./scripts/deploy.sh

# 设置监控（可选）
./scripts/setup-monitoring.sh
```

### � **替访问点**

#### 开发环境
- **应用程序**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **指标**: http://localhost:3000/api/metrics

#### 生产环境
- **应用程序**: https://your-domain.com
- **Grafana仪表板**: http://localhost:3001 (admin/admin123)
- **Prometheus指标**: http://localhost:9090

## 📊 数据管理

### Excel导入/导出
应用程序提供全面的Excel导入和导出功能：

#### 导入流程
1. 导航到Web应用程序中的导入部分
2. 上传您的Excel文件（支持中文标题）
3. 预览数据映射和验证结果
4. 确认并完成导入

#### 导出功能
- 将当前库存导出为Excel格式
- 包含使用历史和分析数据
- 支持中文标题
- 可自定义导出选项

### Excel格式支持
系统支持包含以下列的Excel文件：
- **基本信息**: Group, 编号, 季节, 填充物, 颜色, 长, 宽, 重量（g）
- **存储信息**: 放置位置, 包, 使用时间段, 品牌, 购买日期, 备注
- **使用历史**: 上次使用, 上上次使用等

### 数据验证
- 自动数据类型验证
- 重复检测和处理
- 缺失字段识别
- 数据质量报告

## 🎯 数据模型

### 被子实体（数据库模式）
```sql
CREATE TABLE quilts (
  id TEXT PRIMARY KEY,
  group_id TEXT,
  item_number TEXT UNIQUE,
  name TEXT NOT NULL,
  season TEXT CHECK (season IN ('Winter', 'Spring-Autumn', 'Summer')),
  length_cm INTEGER,
  width_cm INTEGER,
  weight_grams INTEGER,
  fill_material TEXT,
  material_details TEXT,
  color TEXT,
  brand TEXT,
  purchase_date TIMESTAMP,
  location TEXT,
  packaging_info TEXT,
  current_status TEXT CHECK (current_status IN ('available', 'in_use', 'maintenance', 'storage')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_records (
  id TEXT PRIMARY KEY,
  quilt_id TEXT REFERENCES quilts(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 使用跟踪
- **使用记录**：具有开始/结束日期和备注的历史使用
- **当前使用**：实时活动使用跟踪
- **使用分析**：模式、频率和预测洞察
- **季节分析**：基于季节的使用优化和推荐

## 📚 API文档

应用程序使用**tRPC**进行类型安全的API通信。所有API端点都自动类型化和验证。

### 核心tRPC路由器

#### 被子路由器（`quilts`）
- `quilts.list` - 使用过滤和搜索列出被子
- `quilts.getById` - 获取详细的被子信息
- `quilts.create` - 创建新被子
- `quilts.update` - 更新被子信息
- `quilts.delete` - 删除被子
- `quilts.search` - 带过滤器的高级搜索

#### 仪表板路由器（`dashboard`）
- `dashboard.getStats` - 获取仪表板统计信息
- `dashboard.getRecentUsage` - 获取最近使用活动
- `dashboard.getSeasonalDistribution` - 获取季节分析
- `dashboard.getUsagePatterns` - 获取使用模式分析

#### 导入/导出路由器（`importExport`）
- `importExport.analyzeExcel` - 分析上传的Excel文件
- `importExport.importFromExcel` - 从Excel导入数据
- `importExport.exportToExcel` - 导出数据为Excel格式
- `importExport.getImportHistory` - 获取导入历史

### API功能
- **类型安全**：完整的TypeScript支持，自动类型推断
- **输入验证**：所有输入的Zod模式验证
- **错误处理**：结构化错误响应，正确的HTTP状态码
- **实时更新**：WebSocket支持实时数据更新

## 🛠️ 开发

### 技术栈

#### 核心技术
- **前端**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **后端**: tRPC, Neon Serverless Driver, PostgreSQL
- **UI组件**: Radix UI, Lucide Icons, 自定义组件
- **移动端**: PWA, Service Workers, 触摸手势, 离线支持
- **监控**: Prometheus, Grafana, 结构化日志
- **部署**: Docker, Nginx, CI/CD管道

#### 开发工具
- **代码质量**: ESLint, Prettier, TypeScript
- **测试**: Vitest, Jest, Playwright（计划实现）
- **数据库**: Neon控制台, 直接SQL操作
- **构建**: Next.js构建系统, Docker多阶段构建
- **CI/CD**: GitHub Actions

### 开发工具和脚本

#### 可用脚本
```bash
# 开发
npm run dev                    # 启动开发服务器
npm run build                  # 构建生产版本
npm run start                  # 启动生产服务器
npm run lint                   # 运行ESLint
npm run type-check            # TypeScript检查

# 数据库管理
npm run db:setup             # 初始化数据库模式
npm run db:seed              # 用示例数据填充数据库
npm run db:test              # 测试数据库连接

# 生产和部署
npm run docker:build         # 构建Docker镜像
npm run docker:compose:up    # 启动生产堆栈
npm run health:check         # 检查应用程序健康状况
npm run backup:create        # 创建数据库备份
npm run monitoring:up        # 启动监控堆栈
```

### 环境配置

#### 环境变量
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/qms_db"

# 认证（如果实现）
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 可选：Redis缓存
REDIS_URL="redis://localhost:6379"

# 监控和可观察性
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# 应用程序设置
NODE_ENV="production"
PORT=3000
```

## 📦 部署选项

### 🚀 **生产部署（Next.js）**

#### 自动化部署
```bash
cd qms-app

# 配置环境
cp .env.production .env.local
# 编辑生产值

# 部署并启用监控
./scripts/deploy.sh
./scripts/setup-monitoring.sh
```

#### 手动Docker部署
```bash
# 构建并启动生产堆栈
docker-compose -f docker-compose.prod.yml up -d

# 启动监控堆栈
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d

# 访问应用程序
# 主应用: http://localhost:3000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

#### 生产功能
- **SSL/TLS**: 使用Let's Encrypt自动HTTPS
- **监控**: Prometheus指标，Grafana仪表板
- **日志**: 结构化日志与日志聚合
- **备份**: 自动数据库备份
- **健康检查**: 应用程序和数据库健康监控
- **性能**: Nginx反向代理，缓存，压缩

### 🔧 **开发部署**
```bash
# 简单开发设置
cd qms-app
npm install
npm run dev

# 在 http://localhost:3000 访问应用程序
```

### 🔧 **生产检查清单**
- [ ] 环境变量已配置
- [ ] SSL证书已安装
- [ ] 数据库迁移已应用
- [ ] 监控仪表板已配置
- [ ] 备份策略已实施
- [ ] 健康检查已启用
- [ ] 性能优化已应用
- [ ] 安全头已配置

## 🧪 测试

### 应用程序测试
```bash
cd qms-app

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 未来：单元和集成测试
# npm run test
# npm run test:e2e
```

**注意**：全面的测试套件计划作为增强功能路线图的一部分在未来实现。

## 📋 开发路线图

### 第一阶段：基础 ✅
- [x] 使用Neon PostgreSQL的增强数据库模式
- [x] 使用tRPC的全面API层
- [x] Excel数据迁移和导入/导出
- [x] Vue.js原型和Next.js生产应用

### 第二阶段：核心功能 ✅
- [x] 带分析的完整仪表板UI
- [x] 带高级表单的被子管理
- [x] 带虚拟滚动的搜索和过滤
- [x] 带时间轴可视化的使用跟踪

### 第三阶段：高级功能 ✅
- [x] 预测分析和报告
- [x] 维护调度和通知
- [x] 存储优化建议
- [x] 支持离线的渐进式Web应用
- [x] 移动优先响应式设计

### 第四阶段：生产和监控 ✅
- [x] 全面测试套件
- [x] 性能优化和缓存
- [x] 安全加固和认证
- [x] 使用Docker的生产部署
- [x] 使用Prometheus和Grafana的监控
- [x] 自动备份和恢复

### 第五阶段：增强功能 🚧
- [ ] 带AI驱动建议的高级搜索
- [ ] 性能优化（虚拟滚动，缓存）
- [ ] 带预测洞察的增强分析
- [ ] 实时协作功能
- [ ] 高级移动手势和交互
- [ ] 与外部天气API集成

### 第六阶段：企业功能 🔮
- [ ] 带基于角色访问的多用户支持
- [ ] API速率限制和高级安全
- [ ] 高级报告和数据可视化
- [ ] 与家庭自动化系统集成
- [ ] 用于使用预测的机器学习
- [ ] 高级通知系统

## 🤝 贡献

1. Fork存储库
2. 创建您的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开Pull Request

## 📄 许可证

该项目在MIT许可证下授权 - 有关详细信息，请参阅[LICENSE](LICENSE)文件。

## 📞 支持

如有问题或支持，请在GitHub上打开issue或联系开发团队。

## 📚 文档与资源

### 📋 **规范与规划**
- **需求文档**: [增强被子管理需求](.kiro/specs/enhanced-quilt-management/requirements.md)
- **设计文档**: [系统架构与设计](.kiro/specs/enhanced-quilt-management/design.md)
- **任务清单**: [实现任务分解](.kiro/specs/enhanced-quilt-management/tasks.md)

### 🚀 **Next.js应用程序文档**
- **部署指南**: [qms-app/DEPLOYMENT.md](qms-app/DEPLOYMENT.md)
- **监控指南**: [qms-app/MONITORING.md](qms-app/MONITORING.md)
- **清理摘要**: [qms-app/CLEANUP_SUMMARY.md](qms-app/CLEANUP_SUMMARY.md)
- **应用程序README**: [qms-app/README.md](qms-app/README.md)

### 🔧 **开发资源**
- **API文档**: 运行时在`/api/docs`可用
- **数据库操作**: [qms-app/src/lib/neon.ts](qms-app/src/lib/neon.ts)
- **组件库**: Radix UI + `qms-app/src/components/ui/`中的自定义组件

### 🏗️ **项目结构概览**
```
QMS项目/
├── 📱 qms-app/              # 生产Next.js应用程序（主要）
├── 📋 .kiro/specs/          # 开发规范和规划
├── 🔧 .vscode/              # VS Code工作区设置
├── 📊 家中被子列表.xlsx      # 示例Excel数据文件
├── � README文件 c           # 项目文档
└── �️. 遗留原型/             # 参考实现
    ├── frontend/            # Vue.js原型（遗留）
    ├── backend/             # FastAPI原型（遗留）
    └── workers/             # Cloudflare Workers实验（遗留）
```

---

**QMS v2.0** - 将简单的库存跟踪转换为智能床品管理 🛏️✨