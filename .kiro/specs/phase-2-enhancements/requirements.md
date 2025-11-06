# 需求文档

## 简介

本文档定义了被子管理系统（QMS）第二阶段的功能增强需求。该阶段主要聚焦于UI/UX优化、智能功能增强、数据分析能力提升以及多终端支持，旨在提升用户体验和系统实用性。

## 术语表

- **QMS_System**: 被子管理系统（Quilt Management System），用于管理被子库存、使用记录和相关数据的Web应用系统
- **User**: 使用QMS系统的终端用户
- **Quilt_Card**: 被子卡片组件，用于在列表或网格视图中展示单个被子的信息
- **Batch_Operation**: 批量操作功能，允许用户同时对多个被子执行操作
- **Version_Info**: 版本信息显示区域，展示系统版本号和相关链接
- **Weather_API**: 天气数据接口，用于获取天气预报信息
- **OCR_Service**: 光学字符识别服务，用于从图片中提取文字信息
- **PWA**: Progressive Web App，渐进式Web应用，支持离线访问和安装到设备
- **Excel_Template**: Excel模板文件，用于批量导入被子数据
- **Usage_History**: 使用历史记录，记录被子的使用时间和频率
- **Attachment_Image**: 附加图片，被子的额外照片或相关图片

## 需求

### 需求 1: UI布局优化

**用户故事:** 作为用户，我希望界面更简洁清晰，以便更高效地浏览和管理被子信息

#### 验收标准

1. WHEN User访问被子列表页面, THE QMS_System SHALL移除右上角的Batch_Operation按钮
2. THE QMS_System SHALL将列表表头标签文字设置为粗体样式
3. THE QMS_System SHALL将列表表头标签文字设置为居中对齐
4. WHEN User查看Quilt_Card, THE QMS_System SHALL在卡片布局中显示被子的主图片

### 需求 2: 版本信息展示优化

**用户故事:** 作为用户，我希望看到准确的版本信息和快速访问项目资源的入口，以便了解系统状态和获取帮助

#### 验收标准

1. THE QMS_System SHALL从package.json文件读取version字段作为系统版本号
2. THE QMS_System SHALL在页面左下角显示Version_Info区域
3. THE QMS_System SHALL在Version_Info区域显示当前系统版本号
4. THE QMS_System SHALL在Version_Info区域显示GitHub图标链接
5. THE QMS_System SHALL在Version_Info区域显示Vercel图标链接
6. WHEN User点击GitHub图标, THE QMS_System SHALL在新标签页打开项目的GitHub仓库页面
7. WHEN User点击Vercel图标, THE QMS_System SHALL在新标签页打开项目的Vercel部署页面

### 需求 3: 被子附加图片管理

**用户故事:** 作为用户，我希望为每条被子添加多张图片，以便更全面地记录被子的外观和细节

#### 验收标准

1. WHEN User编辑被子信息, THE QMS_System SHALL提供上传Attachment_Image的功能
2. THE QMS_System SHALL允许User为单条被子上传多张Attachment_Image
3. THE QMS_System SHALL在数据库中存储Attachment_Image的URL或路径
4. WHEN User查看被子详情, THE QMS_System SHALL展示该被子的所有Attachment_Image
5. THE QMS_System SHALL允许User删除已上传的Attachment_Image
6. THE QMS_System SHALL支持常见图片格式（JPEG、PNG、WebP）的上传

### 需求 4: 智能换被建议

**用户故事:** 作为用户，我希望系统根据天气情况推荐合适的被子，以便更科学地选择被子

#### 验收标准

1. THE QMS_System SHALL通过Weather_API获取未来7天的天气预报数据
2. THE QMS_System SHALL从天气预报中提取每日最高温度和最低温度
3. THE QMS_System SHALL基于温度范围将被子分类（如：夏被、春秋被、冬被）
4. WHEN 平均温度高于25摄氏度, THE QMS_System SHALL推荐夏被类型的被子
5. WHEN 平均温度在15至25摄氏度之间, THE QMS_System SHALL推荐春秋被类型的被子
6. WHEN 平均温度低于15摄氏度, THE QMS_System SHALL推荐冬被类型的被子
7. THE QMS_System SHALL在仪表板或被子列表页面显示换被建议
8. THE QMS_System SHALL显示推荐理由（包含温度信息）

### 需求 5: Excel模板导入功能完善

**用户故事:** 作为用户，我希望通过Excel快速批量导入被子数据，以便高效地初始化或更新系统数据

#### 验收标准

1. THE QMS_System SHALL提供标准Excel_Template供User下载
2. THE QMS_System SHALL在Excel_Template中包含所有必填字段的列标题
3. THE QMS_System SHALL在Excel_Template中包含字段说明和示例数据
4. WHEN User上传Excel_Template文件, THE QMS_System SHALL验证文件格式是否正确
5. WHEN Excel_Template包含无效数据, THE QMS_System SHALL显示具体的错误信息和行号
6. THE QMS_System SHALL在导入前显示数据预览供User确认
7. WHEN 导入成功, THE QMS_System SHALL显示成功导入的记录数量
8. WHEN 导入部分失败, THE QMS_System SHALL显示成功和失败的记录数量及失败原因

### 需求 6: 被子使用频率统计与淘汰建议

**用户故事:** 作为用户，我希望了解被子的使用情况并获得淘汰建议，以便优化被子库存管理

#### 验收标准

1. THE QMS_System SHALL基于Usage_History计算每条被子的使用频率
2. THE QMS_System SHALL计算每条被子在过去30天、90天和365天的使用次数
3. THE QMS_System SHALL在统计页面显示被子使用频率排行榜
4. THE QMS_System SHALL按使用频率从高到低排序显示被子列表
5. WHEN 被子在过去365天内使用次数为0, THE QMS_System SHALL标记该被子为"建议淘汰"
6. WHEN 被子在过去365天内使用次数少于3次, THE QMS_System SHALL标记该被子为"低使用率"
7. THE QMS_System SHALL在被子详情页显示该被子的使用频率统计
8. THE QMS_System SHALL提供筛选功能以查看"建议淘汰"和"低使用率"的被子

### 需求 7: 多终端PWA支持（简化版）

**用户故事:** 作为用户，我希望在手机、平板等设备上安装和使用QMS应用，以便随时随地查看和管理被子信息

#### 验收标准

1. THE QMS_System SHALL配置Next.js的PWA支持
2. THE QMS_System SHALL生成Web App Manifest文件
3. THE QMS_System SHALL在Manifest中定义应用名称、图标和主题色
4. THE QMS_System SHALL注册Service Worker以缓存静态资源
5. WHEN User在支持PWA的浏览器中访问系统, THE QMS_System SHALL显示"添加到主屏幕"提示
6. THE QMS_System SHALL在离线状态下显示缓存的页面框架和静态内容
7. THE QMS_System SHALL在移动设备上提供优化的触摸交互体验
8. WHEN User在离线状态下尝试修改数据, THE QMS_System SHALL提示需要网络连接

### 需求 8: OCR标签图片导入（可选功能）

**用户故事:** 作为用户，我希望通过拍照被子标签自动识别并录入被子信息，以便快速添加新被子而无需手动输入

**注意:** 此需求为可选功能，实现复杂度高，建议在其他核心需求完成后根据用户反馈决定是否实现。

#### 验收标准

1. THE QMS_System SHALL提供上传被子标签图片的功能
2. WHEN User上传标签图片, THE QMS_System SHALL调用OCR_Service识别图片中的文字
3. THE QMS_System SHALL从识别的文字中提取被子的品牌、型号、材质、尺寸等信息
4. THE QMS_System SHALL使用AI分析提取的信息并映射到系统字段
5. THE QMS_System SHALL在导入前显示识别结果供User确认和修改
6. WHEN User确认识别结果, THE QMS_System SHALL创建新的被子记录或更新现有记录
7. WHEN OCR_Service识别失败或置信度低, THE QMS_System SHALL提示User手动输入或重新拍照
8. THE QMS_System SHALL支持常见的标签格式和布局识别

### 需求 9: 通知系统增强

**用户故事:** 作为用户，我希望收到及时的换被提醒和维护通知，以便更好地管理被子的使用和保养

#### 验收标准

1. WHEN 天气预报显示温度变化超过5摄氏度, THE QMS_System SHALL生成换被建议通知
2. WHEN 被子连续使用超过30天, THE QMS_System SHALL生成清洗维护提醒通知
3. WHEN 被子在过去365天内未使用, THE QMS_System SHALL生成淘汰建议通知
4. THE QMS_System SHALL在通知面板中显示所有未读通知
5. THE QMS_System SHALL在通知图标上显示未读通知数量
6. WHEN User点击通知, THE QMS_System SHALL导航到相关页面或执行相关操作
7. THE QMS_System SHALL允许User标记通知为已读或删除通知
8. THE QMS_System SHALL支持通知优先级分类（高、中、低）

### 需求 10: 搜索与筛选功能增强

**用户故事:** 作为用户，我希望快速找到特定的被子，以便高效地管理大量被子数据

#### 验收标准

1. THE QMS_System SHALL在顶部搜索框支持按名称、编号、材质、位置搜索
2. THE QMS_System SHALL提供高级筛选面板
3. THE QMS_System SHALL在高级筛选中支持按季节、状态、重量范围筛选
4. THE QMS_System SHALL在高级筛选中支持按尺寸范围筛选
5. THE QMS_System SHALL在高级筛选中支持按颜色筛选
6. THE QMS_System SHALL支持多条件组合筛选
7. THE QMS_System SHALL保存User的筛选条件供下次使用
8. THE QMS_System SHALL在搜索结果中高亮显示匹配的关键词

### 需求 11: 数据可视化增强

**用户故事:** 作为用户，我希望通过图表和统计数据了解被子使用情况，以便做出更好的管理决策

#### 验收标准

1. THE QMS_System SHALL在Analytics页面显示被子使用频率柱状图
2. THE QMS_System SHALL在Analytics页面显示季节性使用趋势折线图
3. THE QMS_System SHALL在Analytics页面显示被子状态分布饼图
4. THE QMS_System SHALL在Analytics页面显示温度与被子类型关联热力图
5. THE QMS_System SHALL支持按时间范围筛选统计数据（30天、90天、365天、全部）
6. THE QMS_System SHALL在图表中支持交互式数据探索（悬停显示详情、点击钻取）
7. THE QMS_System SHALL提供数据洞察卡片显示关键指标和趋势
8. THE QMS_System SHALL支持图表导出为图片格式

### 需求 12: 页面交互联动优化

**用户故事:** 作为用户，我希望通过双击或快捷操作在不同页面间快速跳转和执行操作，以便提高使用效率

#### 验收标准

1. WHEN User在仪表板双击"正在使用"列表中的被子记录, THE QMS_System SHALL导航到该被子的详情页面
2. WHEN User在仪表板双击"历史使用"列表中的记录, THE QMS_System SHALL导航到该被子的详情页面
3. WHEN User在使用追踪页面双击使用记录行, THE QMS_System SHALL执行用户预设的操作
4. THE QMS_System SHALL在设置页面提供"使用记录双击行为"配置选项
5. THE QMS_System SHALL支持以下使用记录双击行为选项：编辑记录、查看被子详情、结束使用、无操作
6. THE QMS_System SHALL在所有列表页面提供一致的双击交互体验
7. THE QMS_System SHALL在双击操作时提供视觉反馈（如高亮、动画）
8. THE QMS_System SHALL保存User的双击行为偏好设置

### 需求 13: 设置页面UI优化与默认语言

**用户故事:** 作为用户，我希望设置页面布局更合理、专注于配置项，并且系统默认使用中文，以便快速找到和修改设置

#### 验收标准

1. THE QMS_System SHALL采用两栏布局设计设置页面
2. THE QMS_System SHALL在左侧栏显示可配置的设置项（语言设置、交互行为设置、安全设置）
3. THE QMS_System SHALL在右侧栏显示系统信息（版本号、框架、部署平台、运行环境）
4. THE QMS_System SHALL移除设置页面中的数据库统计信息（被子总数、使用记录等）
5. THE QMS_System SHALL在系统信息卡片中添加状态徽章和图标
6. THE QMS_System SHALL在移动设备上自动切换为单栏布局
7. THE QMS_System SHALL确保两栏布局在不同屏幕尺寸下的响应式适配
8. THE QMS_System SHALL将系统默认语言设置为中文
9. WHEN User首次访问系统, THE QMS_System SHALL自动使用中文界面
10. THE QMS_System SHALL保留数据库连接状态显示（仅显示连接状态，不显示统计数据）
