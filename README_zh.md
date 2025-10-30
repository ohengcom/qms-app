# QMS - 被子管理系统 🛏️

**[English](README.md) | [中文](README_zh.md)**

> **生产就绪的智能家居床品库存管理系统**

一个现代化的 Next.js 应用，使用 Neon PostgreSQL，将简单的 Excel 被子跟踪转变为智能库存管理系统。

**🌐 在线演示**: https://qms-app-omega.vercel.app

## ✨ 核心功能

### 📊 主要功能
- **被子管理**: 完整的增删改查操作，自动生成名称和编号
- **使用追踪**: 自动化使用记录创建，智能状态检测
- **状态管理**: 三种状态（使用中、存储中、维护中）智能转换
- **数据分析**: 使用统计、季节分析、趋势可视化
- **导入导出**: 支持 Excel，完美兼容中文

### 🎨 现代化 UI/UX
- **响应式设计**: 完美适配桌面、平板和手机
- **流畅动画**: Framer Motion 驱动的过渡和微交互
- **双视图模式**: 网格和列表视图无缝切换
- **双语支持**: 完整的中英文界面
- **空状态**: 无数据时的友好引导
- **加载状态**: 骨架屏提升感知性能

### 🔐 安全与认证
- **密码保护**: 安全登录，JWT 会话管理
- **路由保护**: 基于中间件的认证
- **会话持久化**: 记住我功能
- **安全 Cookie**: HTTP-only cookies 存储令牌

### 🚀 性能
- **快速加载**: 首次加载 < 2秒，页面切换 < 500毫秒
- **优化查询**: 索引化数据库操作
- **高效渲染**: React Query 数据缓存
- **无服务器**: Neon PostgreSQL 可扩展数据库

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 16.0.0 (App Router)
- **语言**: TypeScript 5.6.3
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI
- **动画**: Framer Motion
- **状态管理**: Zustand, React Query
- **表单**: React Hook Form + Zod

### 后端
- **数据库**: Neon Serverless PostgreSQL
- **API**: Next.js API Routes
- **认证**: JWT + bcryptjs
- **验证**: Zod schemas

### 开发运维
- **部署**: Vercel
- **版本控制**: Git + GitHub
- **代码质量**: ESLint, Prettier, Husky
- **包管理**: npm

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/ohengcom/qms-app.git
cd qms-app

# 安装依赖
npm install

# 设置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 Neon 数据库 URL

# 设置管理员密码
npm run setup-password

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# 认证
QMS_PASSWORD_HASH="..."
QMS_JWT_SECRET="..."
```

## 📊 数据库结构

### 主要表

**quilts** - 被子信息
- 基本信息：名称、季节、尺寸、重量、材料
- 存储信息：位置、包装、品牌、购买日期
- 状态：current_status (IN_USE, STORAGE, MAINTENANCE)

**usage_records** - 使用记录
- 被子引用
- 开始/结束日期
- 状态 (ACTIVE, COMPLETED)
- 备注

## 🎯 核心功能详解

### 1. 自动化使用追踪

当你更改被子状态时：
- **改为使用中**: 自动创建新的使用记录
- **从使用中改为其他**: 自动结束活动的使用记录
- **日期选择**: 可选择自定义开始/结束日期
- **备注支持**: 可添加可选备注

### 2. 智能被子命名

自动生成格式：
`品牌 + 颜色 + 重量 + 季节`

示例：`百思寒褐色1100克春秋被`

### 3. 双视图模式

**网格视图**：
- 美观的卡片布局
- 季节颜色指示器
- 状态徽章
- 悬停效果
- 响应式列数（1-4列）

**列表视图**：
- 详细的表格格式
- 可排序列
- 批量操作
- 快速操作

### 4. 空状态

友好的引导，当：
- 没有被子数据
- 搜索无结果
- 没有使用记录
- 带有帮助性操作按钮

## 📚 可用脚本

```bash
# 开发
npm run dev                    # 启动开发服务器
npm run build                  # 生产构建
npm run start                  # 启动生产服务器
npm run lint                   # 运行 ESLint
npm run type-check            # TypeScript 检查

# 数据库设置
npm run setup-usage-tracking   # 设置使用追踪数据库

# 工具
npm run setup-password         # 设置管理员密码
npm run audit-translations     # 检查翻译覆盖率
npm run update-quilt-names     # 更新被子名称
```

## 📁 项目结构

```
qms-app/
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── api/              # API 路由
│   │   ├── login/            # 登录页面
│   │   ├── quilts/           # 被子管理
│   │   ├── usage/            # 使用追踪
│   │   ├── analytics/        # 数据分析
│   │   └── reports/          # 报表
│   ├── components/           # React 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   ├── motion/          # 动画组件
│   │   ├── quilts/          # 被子组件
│   │   └── layout/          # 布局组件
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具库
│   │   ├── neon.ts         # 数据库操作
│   │   ├── auth.ts         # 认证
│   │   ├── i18n.ts         # 国际化
│   │   └── animations.ts   # 动画配置
│   └── server/             # 服务器代码
├── scripts/                # 工具脚本
├── docs/                   # 文档
│   ├── guides/            # 实现指南
│   ├── archive/           # 历史文档
│   └── sessions/          # 开发会话
└── .kiro/specs/           # 功能规格
```

## 🎨 UI 组件

### 动画组件
- `PageTransition` - 页面淡入淡出过渡
- `AnimatedCard` - 带悬停效果的卡片
- `AnimatedList` - 交错列表动画
- `AnimatedButton` - 按钮按压动画
- `AnimatedInput` - 输入框焦点动画
- `SwipeableListItem` - 滑动删除

### UI 组件
- `EmptyState` - 友好的空状态
- `Skeleton` - 加载占位符
- `StatusChangeDialog` - 智能状态更新
- `QuiltDialog` - 被子添加/编辑表单

## 📖 文档

### 指南 (docs/guides/)
- **认证**: 实现和测试
- **部署**: Vercel 部署指南
- **使用追踪**: 自动化实现
- **安全**: 安全审计总结

### 归档 (docs/archive/)
- Phase 1 完成总结
- 实现记录
- 历史修复

### 会话 (docs/sessions/)
- 开发会话日志
- 功能实现笔记

## 🗺️ 路线图

### ✅ 已完成 (Phase 1)
- 认证系统
- 双语支持
- 数据验证
- UI 增强
- 使用追踪自动化

### 🚧 进行中 (Phase 1D)
- 设置页面
- 主题切换（深色模式）
- 显示偏好
- 通知设置

### 📋 计划中 (Phase 2)
- 图片上传
- 高级搜索
- 批量编辑
- 标签系统
- 数据导出增强

## 🤝 贡献

这是一个个人项目。欢迎通过 Pull Request 贡献。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

如有问题或建议，请在 GitHub 上提 issue。

## 🙏 致谢

- 使用 [Next.js](https://nextjs.org/) 构建
- UI 组件来自 [Radix UI](https://www.radix-ui.com/)
- 动画由 [Framer Motion](https://www.framer.com/motion/) 提供
- 数据库使用 [Neon](https://neon.tech/)
- 部署在 [Vercel](https://vercel.com/)

---

**版本**: 0.2.2  
**状态**: ✅ 生产就绪  
**最后更新**: 2025-01-16

用 ❤️ 打造，为了更好的家居整理
