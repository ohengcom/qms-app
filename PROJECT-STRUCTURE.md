# QMS 项目结构 / QMS Project Structure

**最后更新 / Last Updated**: 2025-11-03

---

## 📁 项目目录结构 / Project Directory Structure

```
qms/
├── .github/              # GitHub 配置（Actions, workflows）
├── .husky/              # Git hooks 配置
├── .kiro/               # Kiro AI 配置和需求规格
│   ├── specs/          # 📋 需求规格（主要）
│   │   ├── SPECS-INDEX.md    # 需求规格总索引
│   │   ├── active/           # 活跃需求
│   │   ├── completed/        # 已完成需求
│   │   └── archived/         # 已归档需求
│   └── steering/       # AI 指导规则
├── .next/               # Next.js 构建输出
├── .vscode/             # VS Code 配置
├── docs/                # 📚 文档
│   ├── INDEX.md        # 文档索引
│   ├── README.md       # 文档说明
│   ├── guides/         # 实现指南
│   ├── sessions/       # 开发会话记录
│   └── archive/        # 历史文档
├── migrations/          # 数据库迁移脚本
├── node_modules/        # NPM 依赖
├── public/              # 静态资源
├── scripts/             # 工具脚本
├── src/                 # 源代码
│   ├── app/            # Next.js App Router 页面
│   ├── components/     # React 组件
│   ├── hooks/          # React Hooks
│   ├── lib/            # 工具库
│   │   ├── database/   # 数据库相关
│   │   └── repositories/ # 仓储模式
│   └── server/         # 服务端代码
│       └── api/        # tRPC API
├── .env.example         # 环境变量示例
├── .env.local          # 本地环境变量（不提交）
├── .gitignore          # Git 忽略文件
├── CHANGELOG.md        # 📝 变更日志
├── LICENSE             # 许可证
├── package.json        # NPM 配置
├── PROJECT_STATUS.md   # 📊 项目状态
├── README.md           # 项目说明（英文）
├── README_zh.md        # 项目说明（中文）
└── tsconfig.json       # TypeScript 配置
```

---

## 📖 主要目录说明 / Main Directories

### `.kiro/specs/` - 需求规格（最重要）

**用途**: 功能需求、设计文档、任务管理  
**入口**: [.kiro/specs/SPECS-INDEX.md](.kiro/specs/SPECS-INDEX.md)

**包含**:

- `active/` - 当前正在开发的需求
- `completed/` - 已完成的需求
- `archived/` - 已归档的需求

### `docs/` - 文档

**用途**: 实现指南、开发会话、历史文档  
**入口**: [docs/INDEX.md](docs/INDEX.md)

**包含**:

- `guides/` - 实现指南（数据库、认证、部署等）
- `sessions/` - 开发会话记录
- `archive/` - 历史文档和总结

### `src/` - 源代码

**用途**: 应用程序源代码

**结构**:

```
src/
├── app/              # Next.js 页面和路由
│   ├── (auth)/      # 认证相关页面
│   ├── api/         # API 路由
│   ├── quilts/      # 被子管理页面
│   ├── settings/    # 设置页面
│   └── usage/       # 使用追踪页面
├── components/       # React 组件
│   ├── quilts/      # 被子相关组件
│   ├── settings/    # 设置相关组件
│   ├── ui/          # UI 基础组件
│   └── usage/       # 使用追踪组件
├── hooks/           # 自定义 React Hooks
├── lib/             # 工具库
│   ├── database/    # 数据库连接和类型
│   ├── repositories/ # 仓储模式实现
│   └── utils/       # 工具函数
└── server/          # 服务端代码
    └── api/         # tRPC API 路由
```

### `migrations/` - 数据库迁移

**用途**: 数据库结构变更脚本

**文件**:

- `001_create_quilts.sql` - 创建被子表
- `002_create_usage.sql` - 创建使用记录表
- `003_add_usage_indexes.sql` - 添加索引
- `004_create_system_settings.sql` - 创建系统设置表

### `scripts/` - 工具脚本

**用途**: 开发和维护脚本

**包含**:

- `init-system-settings.ts` - 初始化系统设置
- `seed-test-data.ts` - 生成测试数据
- `test-*.ts` - 各种测试脚本

### `public/` - 静态资源

**用途**: 公开访问的静态文件

**包含**:

- `clear-cache.html` - 缓存清理页面
- 图片、图标等静态资源

---

## 📋 重要文件说明 / Important Files

### 根目录文件

#### 项目说明

- `README.md` - 英文项目说明
- `README_zh.md` - 中文项目说明
- `PROJECT_STATUS.md` - 项目当前状态
- `PROJECT-STRUCTURE.md` - 本文件，项目结构说明

#### 变更记录

- `CHANGELOG.md` - 版本变更日志
- `DOCS-ORGANIZATION-2025-11-03.md` - 文档整理总结

#### 配置文件

- `package.json` - NPM 依赖和脚本
- `tsconfig.json` - TypeScript 配置
- `next.config.js` - Next.js 配置
- `eslint.config.mjs` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `vercel.json` - Vercel 部署配置

#### 环境变量

- `.env.example` - 环境变量示例
- `.env.local` - 本地环境变量（不提交到 Git）
- `.env.production` - 生产环境变量（不提交到 Git）

---

## 🎯 快速导航 / Quick Navigation

### 我想...

#### 了解项目

→ [README_zh.md](README_zh.md) 或 [README.md](README.md)

#### 查看需求和任务

→ [.kiro/specs/SPECS-INDEX.md](.kiro/specs/SPECS-INDEX.md)

#### 查看项目状态

→ [PROJECT_STATUS.md](PROJECT_STATUS.md)

#### 查看实现指南

→ [docs/guides/](docs/guides/)

#### 查看开发历史

→ [docs/sessions/](docs/sessions/)

#### 查看变更日志

→ [CHANGELOG.md](CHANGELOG.md)

#### 设置开发环境

→ [docs/guides/INITIALIZE-DATABASE.md](docs/guides/INITIALIZE-DATABASE.md)

#### 部署到 Vercel

→ [docs/guides/VERCEL-ENV-SETUP.md](docs/guides/VERCEL-ENV-SETUP.md)

---

## 🔧 开发工作流 / Development Workflow

### 1. 新功能开发

1. 在 `.kiro/specs/active/` 创建需求规格
2. 编写 requirements.md, design.md, tasks.md
3. 按任务列表实现功能
4. 完成后移至 `.kiro/specs/completed/`

### 2. 代码开发

1. 在 `src/` 中编写代码
2. 遵循现有的目录结构
3. 使用 TypeScript 和类型安全
4. 编写必要的测试

### 3. 数据库变更

1. 在 `migrations/` 创建迁移脚本
2. 按顺序编号（001, 002, ...）
3. 测试迁移脚本
4. 更新文档

### 4. 文档更新

1. 更新相关的实现指南
2. 记录重要变更到 CHANGELOG.md
3. 更新 PROJECT_STATUS.md
4. 创建会话总结（如需要）

---

## 📊 技术栈 / Tech Stack

### 前端

- **框架**: Next.js 15 (App Router)
- **UI**: React 19
- **样式**: Tailwind CSS 3.4
- **组件**: shadcn/ui
- **图标**: Lucide React
- **状态管理**: React Query (TanStack Query)

### 后端

- **API**: tRPC 11.7
- **验证**: Zod
- **数据库**: Neon PostgreSQL (Serverless)
- **ORM**: 原生 SQL + 仓储模式

### 开发工具

- **语言**: TypeScript 5.9
- **包管理**: npm
- **代码格式**: Prettier
- **代码检查**: ESLint
- **Git Hooks**: Husky
- **部署**: Vercel

---

## 🎨 代码组织原则 / Code Organization Principles

### 1. 关注点分离

- UI 组件在 `src/components/`
- 业务逻辑在 `src/lib/`
- API 在 `src/server/api/`
- 页面在 `src/app/`

### 2. 仓储模式

- 数据访问通过仓储（Repository）
- 位于 `src/lib/repositories/`
- 统一的错误处理和日志

### 3. 类型安全

- 使用 TypeScript strict 模式
- 数据库类型定义在 `src/lib/database/types.ts`
- tRPC 提供端到端类型安全

### 4. 组件组织

- 按功能模块组织（quilts, usage, settings）
- 共享 UI 组件在 `src/components/ui/`
- 每个组件一个文件

---

## 📝 命名约定 / Naming Conventions

### 文件命名

- 组件: `PascalCase.tsx` (例如: `QuiltCard.tsx`)
- 工具函数: `camelCase.ts` (例如: `formatDate.ts`)
- 页面: `page.tsx` (Next.js App Router)
- API 路由: `route.ts` (Next.js App Router)

### 目录命名

- 使用 `kebab-case` (例如: `system-settings`)
- 功能模块使用复数 (例如: `quilts`, `components`)

### 变量命名

- 变量和函数: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 类型和接口: `PascalCase`
- 私有成员: `_camelCase`

---

## 🔒 安全和最佳实践 / Security & Best Practices

### 环境变量

- 敏感信息存储在 `.env.local`
- 不提交 `.env.local` 到 Git
- 使用 `.env.example` 作为模板

### 数据库

- 使用参数化查询防止 SQL 注入
- 通过仓储模式访问数据
- 记录所有数据库操作

### API

- 使用 tRPC 的输入验证
- 实现适当的错误处理
- 记录 API 调用

### 代码质量

- 运行 ESLint 和 Prettier
- 使用 TypeScript strict 模式
- 编写清晰的注释

---

## 📞 获取帮助 / Getting Help

### 文档

- 查看 [docs/INDEX.md](docs/INDEX.md)
- 查看 [.kiro/specs/SPECS-INDEX.md](.kiro/specs/SPECS-INDEX.md)

### 问题

- 查看 GitHub Issues
- 查看 `docs/archive/` 中的问题修复记录

### 开发

- 查看 `docs/guides/` 中的实现指南
- 查看 `docs/sessions/` 中的开发记录

---

**项目结构版本 / Structure Version**: 1.0  
**创建日期 / Created**: 2025-11-03  
**维护者 / Maintainer**: Sean Li

---

## 🔗 相关链接 / Related Links

- **GitHub**: https://github.com/ohengcom/qms-app
- **生产环境 / Production**: https://qms-app-omega.vercel.app
- **需求规格 / Specs**: [.kiro/specs/SPECS-INDEX.md](.kiro/specs/SPECS-INDEX.md)
- **文档索引 / Docs**: [docs/INDEX.md](docs/INDEX.md)
