# Requirements Document

## Introduction

本需求文档描述了QMS家庭被子管理系统的第二阶段UI改进计划。基于用户的初步测试反馈，本次改进将优化整体框架、仪表板、被子管理、数据分析、导入导出和系统设置等多个模块，以提升用户体验和系统可用性。

## Glossary

- **QMS**: Quilt Management System，被子管理系统
- **System**: QMS家庭被子管理系统应用程序
- **User**: 使用QMS系统的家庭用户
- **Dashboard**: 仪表面板，系统主页面
- **Quilt**: 被子，系统管理的主要实体
- **Usage Tracking**: 使用追踪，记录被子使用历史的功能
- **Analytics**: 数据分析，展示被子使用统计的功能
- **Import/Export**: 导入导出，数据批量处理功能
- **Settings**: 系统设置，应用配置页面
- **Double-click Action**: 双击行为，用户在表格行上双击触发的操作
- **Status**: 状态，被子的当前使用状态（使用中/存储中/维护中）
- **Location**: 位置，被子的存放位置
- **Active Usage Record**: 活跃使用记录，当前正在进行的使用记录

## Requirements

### Requirement 1: 整体框架优化

**User Story:** 作为用户，我希望系统的整体框架更加简洁专业，以便快速识别系统功能和进行操作。

#### Acceptance Criteria

1. WHEN User访问System的任何页面，THE System SHALL在左上角显示"QMS家庭被子管理系统"标题
2. WHEN User访问System的任何页面，THE System SHALL移除右上角的语言选择器组件
3. WHEN User访问登录页面，THE System SHALL将登录框垂直居中显示在页面中央

### Requirement 2: 仪表面板页面改进

**User Story:** 作为用户，我希望仪表面板页面信息更加紧凑清晰，以便快速了解系统状态和当前使用情况。

#### Acceptance Criteria

1. THE System SHALL将页面标题从"仪表板"更改为"仪表面板"
2. THE System SHALL移除页面副标题"被子管理系统 管理您的被子收藏和使用情况"
3. WHEN System显示日期和天气信息，THE System SHALL将两者放置在同一行并使用更大的字体
4. WHEN System显示"当前在用被子"列表，THE System SHALL将每个被子的信息合并为单行显示，不再分大小字两行
5. WHEN System显示"往年今日使用被子"列表，THE System SHALL将每个记录的信息合并为单行显示，不再分大小字两行

### Requirement 3: 被子管理页面增强

**User Story:** 作为用户，我希望被子管理页面提供更灵活的操作方式和更合理的默认值，以便快速管理被子信息。

#### Acceptance Criteria

1. WHEN User双击被子列表中的任意行，THE System SHALL根据用户在设置中配置的双击行为执行相应操作
2. WHERE User未配置双击行为，THE System SHALL默认执行"更新被子状态"操作
3. WHEN User在设置页面配置双击行为，THE System SHALL提供三个选项："无动作"、"修改状态"、"编辑被子"
4. WHEN User在添加被子表单中查看重量字段，THE System SHALL在标签后显示"(g)"单位标识
5. WHEN User在添加被子表单中创建新被子，THE System SHALL将品牌字段默认值设置为"无品牌"
6. WHEN User在添加被子表单中创建新被子，THE System SHALL将位置字段默认值设置为"未存储"
7. WHEN User使用数字输入框右侧小箭头调整长度、宽度或重量，THE System SHALL直接调整整数位而非小数位
8. WHEN User将被子状态改为"使用中"，THE System SHALL自动将位置字段更新为"在用"
9. WHEN User将被子状态改为"使用中"，THE System SHALL在使用追踪表中创建新的活跃使用记录

### Requirement 4: 数据分析页面优化

**User Story:** 作为用户，我希望数据分析页面展示更有价值的信息，以便了解被子的实际使用情况。

#### Acceptance Criteria

1. THE System SHALL将页面标题从"分析"更改为"数据分析"
2. WHEN System显示状态分布图表，THE System SHALL移除"可用"状态的统计数据
3. WHEN System显示"Most used quilts"列表，THE System SHALL使用更紧凑的布局减少行间距

### Requirement 5: 导入导出页面重构

**User Story:** 作为用户，我希望有专门的导入导出页面集中管理数据，以便批量处理被子信息。

#### Acceptance Criteria

1. THE System SHALL将"报告"页面标题更改为"导入导出"
2. THE System SHALL移除报告页面中的报告生成功能
3. THE System SHALL移除报告页面中的快速操作功能
4. THE System SHALL在导入导出页面提供Excel文件导入功能
5. WHEN User选择Excel文件导入，THE System SHALL支持.xls和.xlsx格式文件
6. THE System SHALL在导入导出页面提供CSV格式导出功能
7. THE System SHALL在导入导出页面提供JSON格式导出功能

### Requirement 6: 系统设置页面更新

**User Story:** 作为用户，我希望在系统设置中配置个性化选项，以便系统行为符合我的使用习惯。

#### Acceptance Criteria

1. THE System SHALL将页面标题从"设置"更改为"系统设置"
2. THE System SHALL在系统设置页面添加"双击行为"配置选项
3. WHEN User配置双击行为，THE System SHALL提供"无动作"、"修改状态"、"编辑被子"三个选项
4. WHEN User选择双击行为选项，THE System SHALL立即保存配置并应用到被子管理页面

### Requirement 7: 版本号更新

**User Story:** 作为开发者，我希望更新系统版本号，以便标识本次改进的完成。

#### Acceptance Criteria

1. WHEN 所有改进完成后，THE System SHALL将版本号从当前版本更新为0.5.0
2. THE System SHALL在package.json文件中更新版本号
3. THE System SHALL在系统设置页面显示更新后的版本号
