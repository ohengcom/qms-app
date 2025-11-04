# Implementation Plan

## Task Overview

本实施计划将UI改进分为7个主要任务组，每个任务组包含具体的实施步骤。任务按照依赖关系排序，确保每个步骤都能基于前面的工作进行。

---

## 1. 整体框架优化 ✅

- [x] 1.1 更新AppLayout组件标题和移除语言选择器
  - 修改 `src/components/layout/AppLayout.tsx`
  - 将左上角标题改为"QMS家庭被子管理系统"
  - 移除右上角的 `<LanguageSwitcher />` 组件
  - 保留其他功能（通知、退出登录等）
  - _Requirements: 1.1, 1.2_

- [x] 1.2 更新应用元数据
  - 修改 `src/app/layout.tsx`
  - 更新 metadata.title 为 "QMS - 家庭被子管理系统"
  - 更新 metadata.description
  - _Requirements: 1.1_

- [x] 1.3 优化登录页面布局
  - 修改 `src/app/login/page.tsx`
  - 调整登录框为垂直居中布局
  - 使用 flex items-center justify-center 实现居中
  - 测试不同屏幕尺寸下的显示效果
  - _Requirements: 1.3_

---

## 2. 仪表面板页面改进 ✅

- [x] 2.1 更新页面标题和移除副标题
  - 修改 `src/app/page.tsx`
  - 将页面标题从"仪表板"改为"仪表面板"
  - 移除副标题文本
  - 更新翻译文件 `src/lib/i18n.ts` 中的相关键值
  - _Requirements: 2.1, 2.2_

- [x] 2.2 优化日期和天气显示布局
  - 修改 `src/app/page.tsx` 中的日期和天气组件
  - 将日期和天气放在同一行显示
  - 增大字体大小（从 text-sm 改为 text-base）
  - 调整图标大小（从 w-4 h-4 改为 w-5 h-5）
  - 优化间距和对齐
  - _Requirements: 2.3_

- [x] 2.3 重构当前在用被子列表为单行显示
  - 修改 `src/app/page.tsx` 中的 inUseQuilts 渲染逻辑
  - 将被子信息合并为单行：名称、编号、季节、材料、重量、位置
  - 使用 flex 布局和适当的间距
  - 移除多行嵌套的 div 结构
  - 保持"查看详情"链接在右侧
  - _Requirements: 2.4_

- [x] 2.4 重构往年今日使用被子列表为单行显示
  - 修改 `src/app/page.tsx` 中的 historicalUsage 渲染逻辑
  - 将记录信息合并为单行：年份、名称、编号、季节、日期范围
  - 使用紧凑的布局和统一的字体大小
  - 优化日期格式显示
  - _Requirements: 2.5_

---

## 3. 被子管理页面增强 ✅

- [x] 3.1 实现双击行为功能
  - 修改 `src/app/quilts/page.tsx`
  - 添加 doubleClickAction 状态管理
  - 从系统设置中加载双击行为配置
  - 实现 handleRowDoubleClick 函数处理三种行为：无动作、修改状态、编辑被子
  - 在表格行添加 onDoubleClick 事件监听
  - 添加 cursor-pointer 样式提示可点击
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.2 更新QuiltForm默认值和标签
  - 修改 `src/components/quilts/QuiltForm.tsx`
  - 设置品牌字段默认值为"无品牌"
  - 设置位置字段默认值为"未存储"
  - 在重量字段标签后添加"(g)"单位标识
  - 更新表单验证规则以支持新默认值
  - _Requirements: 3.4, 3.5, 3.6_

- [x] 3.3 优化数字输入框步进行为
  - 修改 `src/components/quilts/QuiltForm.tsx`
  - 为长度、宽度、重量输入框添加 step="1" 属性
  - 确保小箭头点击时只调整整数位
  - 添加 min="0" 防止负数输入
  - 测试数字输入的用户体验
  - _Requirements: 3.7_

- [x] 3.4 实现状态变更时的自动位置更新
  - 修改 `src/app/quilts/page.tsx`
  - 在状态改为"使用中"时，自动将位置更新为"在用"
  - 更新 handleStatusChange 函数逻辑
  - 添加位置字段到更新请求中
  - _Requirements: 3.8_

- [x] 3.5 实现状态变更时自动创建使用记录
  - 修改 `src/app/quilts/page.tsx`
  - 在状态改为"使用中"时，调用创建使用记录API
  - 设置 startDate 为当前时间
  - 设置 usageType 为 'REGULAR'
  - 添加错误处理和回滚机制
  - _Requirements: 3.9_

- [ ]\* 3.6 添加双击行为的单元测试
  - 创建测试文件测试双击行为的三种模式
  - 测试从设置加载配置的逻辑
  - 测试双击事件触发正确的处理函数
  - _Requirements: 3.1, 3.2, 3.3_

---

## 4. 数据分析页面优化 ✅

- [x] 4.1 更新页面标题
  - 修改 `src/app/analytics/page.tsx`
  - 将页面标题从"分析"改为"数据分析"
  - 更新翻译文件中的相关键值
  - _Requirements: 4.1_

- [x] 4.2 移除状态分布中的"可用"状态
  - 修改 `src/app/analytics/page.tsx`
  - 从 statusDistribution 对象中移除 AVAILABLE 状态
  - 只保留 IN_USE、STORAGE、MAINTENANCE 三个状态
  - 更新图表渲染逻辑
  - 调整百分比计算以适应新的状态数量
  - _Requirements: 4.2_

- [x] 4.3 优化Most used quilts列表布局
  - 修改 `src/app/analytics/page.tsx`
  - 减少列表项的内边距（从 p-4 改为 p-3）
  - 调整排名徽章大小（从 w-8 h-8 改为 w-6 h-6）
  - 将被子名称和平均天数放在同一行
  - 优化使用次数的显示样式
  - _Requirements: 4.3_

---

## 5. 导入导出页面重构 ✅

- [x] 5.1 重命名和重构报告页面
  - 将 `src/app/reports/page.tsx` 重命名为 `src/app/import-export/page.tsx`
  - 更新页面标题为"导入导出"
  - 移除所有报告生成相关的代码
  - 移除快速操作部分
  - 创建基础的Tab布局（导入/导出）
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5.2 创建导入组件
  - 创建 `src/components/import/ImportUpload.tsx`
  - 实现文件上传UI（支持拖拽和点击选择）
  - 添加文件类型验证（.xls, .xlsx）
  - 添加文件大小验证（最大10MB）
  - 显示上传进度
  - _Requirements: 5.4, 5.5_

- [ ] 5.3 创建导入预览组件
  - 创建 `src/components/import/ImportPreview.tsx`
  - 解析Excel文件并显示数据预览
  - 实现数据验证逻辑
  - 显示验证错误和警告
  - 提供确认导入按钮
  - _Requirements: 5.5_

- [ ] 5.4 创建导入结果组件
  - 创建 `src/components/import/ImportResults.tsx`
  - 显示导入进度
  - 显示成功和失败的记录数
  - 列出失败记录的详细错误信息
  - 提供重新导入选项
  - _Requirements: 5.5_

- [ ] 5.5 创建导出组件
  - 创建 `src/components/export/ExportOptions.tsx`
  - 实现CSV导出功能
  - 实现JSON导出功能
  - 添加导出格式说明
  - 显示导出进度
  - _Requirements: 5.6, 5.7_

- [ ] 5.6 实现导入API路由
  - 创建 `src/server/api/routers/import.ts`
  - 实现文件解析逻辑（使用xlsx库）
  - 实现数据验证
  - 实现批量创建被子记录
  - 添加事务处理确保数据一致性
  - _Requirements: 5.4, 5.5_

- [ ] 5.7 更新导航菜单
  - 修改 `src/components/layout/AppLayout.tsx`
  - 将"报告"菜单项改为"导入导出"
  - 更新路由路径从 /reports 到 /import-export
  - 更新图标和描述文本
  - _Requirements: 5.1_

- [ ]\* 5.8 添加导入导出的集成测试
  - 测试完整的导入流程
  - 测试CSV和JSON导出功能
  - 测试错误处理和验证逻辑
  - _Requirements: 5.4, 5.5, 5.6, 5.7_

---

## 6. 系统设置页面更新 ✅

- [x] 6.1 更新页面标题
  - 修改 `src/app/settings/page.tsx`
  - 将页面标题从"设置"改为"系统设置"
  - 更新翻译文件中的相关键值
  - _Requirements: 6.1_

- [x] 6.2 添加双击行为配置选项
  - 修改 `src/app/settings/page.tsx`
  - 创建新的Card组件用于被子管理设置
  - 添加Select组件选择双击行为
  - 提供三个选项：无动作、修改状态、编辑被子
  - 为每个选项添加说明文本
  - _Requirements: 6.2, 6.3_

- [x] 6.3 实现双击行为配置的保存逻辑
  - 修改 `src/app/settings/page.tsx`
  - 实现 handleDoubleClickActionChange 函数
  - 调用API更新系统设置
  - 添加成功/失败提示
  - 确保配置立即生效
  - _Requirements: 6.3, 6.4_

- [x] 6.4 扩展SystemSettings数据模型
  - 修改 `src/server/api/routers/settings.ts`
  - 添加 doubleClickAction 字段到 SystemSettings 接口
  - 类型定义为 'none' | 'status' | 'edit'
  - 设置默认值为 'status'
  - _Requirements: 6.2_

- [x] 6.5 更新系统设置API
  - 修改 `src/server/api/routers/settings.ts`
  - 更新 updateAppSettings mutation 支持 doubleClickAction 字段
  - 添加字段验证
  - 更新数据库查询
  - _Requirements: 6.3, 6.4_

- [x] 6.6 创建数据库迁移脚本
  - 创建 `migrations/005_add_double_click_action.sql`
  - 添加 double_click_action 列到 system_settings 表
  - 设置默认值为 'status'
  - 添加CHECK约束限制值范围
  - _Requirements: 6.2_

---

## 7. 版本号更新和最终验证 ✅

- [x] 7.1 更新版本号
  - 修改 `package.json`
  - 将 version 从当前版本更新为 "0.5.0"
  - _Requirements: 7.1, 7.2_

- [x] 7.2 更新系统信息显示
  - 修改 `src/app/settings/page.tsx`
  - 确保系统设置页面显示新版本号
  - 修改 `src/components/layout/AppLayout.tsx`
  - 确保侧边栏底部显示新版本号
  - _Requirements: 7.3_

- [x] 7.3 运行数据库迁移
  - 执行所有新的迁移脚本
  - 验证数据库结构更新成功
  - 检查默认值是否正确设置
  - _Requirements: 6.2_

- [x] 7.4 执行完整的功能测试
  - 测试整体框架的所有更改
  - 测试仪表面板的新布局
  - 测试被子管理的双击行为
  - 测试数据分析页面的优化
  - 测试导入导出功能
  - 测试系统设置的新选项
  - _Requirements: All_

- [x] 7.5 更新文档
  - 更新 CHANGELOG.md 记录所有更改
  - 更新 README.md 如有必要
  - 创建版本发布说明
  - _Requirements: 7.1_

- [ ]\* 7.6 执行E2E测试
  - 运行完整的端到端测试套件
  - 验证所有用户流程正常工作
  - 检查性能指标
  - _Requirements: All_

---

## Notes

- 标记为 `*` 的任务为可选测试任务，可根据时间和资源情况决定是否执行
- 每个任务完成后应进行代码审查和基本功能测试
- 建议按照任务组的顺序执行，确保依赖关系正确
- 在开始实施前，建议创建新的git分支进行开发
- 所有数据库更改应先在开发环境测试，确认无误后再应用到生产环境
