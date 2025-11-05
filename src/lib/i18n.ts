// 支持的语言类型
export type Language = 'zh' | 'en';

// 翻译内容接口
export interface Translations {
  [key: string]: string | Translations;
}

// 语言上下文接口
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// 翻译内容
export const translations = {
  zh: {
    // 认证
    auth: {
      login: '登录',
      logout: '退出登录',
      password: '密码',
      passwordPlaceholder: '请输入密码',
      rememberMe: '记住我（30天）',
      loginTitle: 'QMS 被子管理系统',
      loginSubtitle: '请登录以继续',
      loginButton: '登录',
      loggingIn: '登录中...',
      invalidPassword: '密码错误',
      tooManyAttempts: '尝试次数过多，请15分钟后再试',
      sessionExpired: '会话已过期，请重新登录',
      loginSuccess: '登录成功',
      logoutSuccess: '已退出登录',
      logoutConfirm: '确定要退出登录吗？',
    },

    // 导航和通用
    navigation: {
      dashboard: '仪表面板',
      quilts: '被子管理',
      usage: '使用跟踪',
      analytics: '数据分析',
      maintenance: '维护',
      reports: '导入导出',
      settings: '系统设置',
    },

    // 仪表板
    dashboard: {
      title: '仪表面板',
      subtitle: '',
      stats: {
        totalQuilts: '被子总数',
        inUse: '使用中',
        available: '可用',
        storage: '存储中',
        maintenance: '维护中',
      },
      seasonal: {
        title: '季节分布',
        winter: '冬季',
        springAutumn: '春秋',
        summer: '夏季',
      },
      actions: {
        title: '快速操作',
        viewQuilts: '查看被子',
        usageTracking: '使用跟踪',
        importData: '导入数据',
        exportData: '导出数据',
      },
      success: {
        title: '成功！',
        message: 'QMS 应用程序正在运行，仪表板数据已成功加载。',
      },
    },

    // 被子管理
    quilts: {
      title: '被子收藏',
      subtitle: '管理您的被子并跟踪使用情况',
      actions: {
        add: '添加被子',
        addFirst: '添加您的第一床被子',
        search: '搜索被子...',
      },
      views: {
        card: '卡片',
        list: '列表',
        name: '名称',
        actions: '操作',
      },
      table: {
        itemNumber: '编号',
        season: '季节',
        size: '尺寸',
        weight: '重量',
        material: '材料',
        color: '颜色',
        location: '位置',
        status: '状态',
      },
      form: {
        name: '被子名称',
        length: '长度 (cm)',
        width: '宽度 (cm)',
        color: '颜色',
        brand: '品牌',
        materialDetails: '材料详情',
        namePlaceholder: '例如：冬季羽绒被',
        colorPlaceholder: '白色',
        materialPlaceholder: '羽绒',
        brandPlaceholder: '品牌名称',
        locationPlaceholder: '卧室衣柜',
        materialDetailsPlaceholder: '详细的材料信息...',
        notesPlaceholder: '其他备注信息...',
      },
      messages: {
        noQuiltsFound: '未找到被子',
        showing: '显示',
        of: '共',
        quilts: '床被子',
      },
      dialogs: {
        addTitle: '添加被子',
        editTitle: '编辑被子',
        addDesc: '添加新的被子到您的收藏',
        editDesc: '修改被子信息',
        changeStatus: '更改状态',
        changeStatusDesc: '更改被子 "{name}" 的状态',
        currentStatus: '当前状态',
        newStatus: '新状态',
      },
    },

    // 使用跟踪
    usage: {
      title: '使用跟踪',
      subtitle: '监控和跟踪被子使用情况',
      selection: {
        title: '选择要跟踪的被子',
        description: '选择一床被子来查看和管理其使用情况',
        prompt: '从上面的列表中选择一床被子来查看和跟踪其使用情况',
      },
      details: {
        title: '使用详情',
        actions: '使用操作',
        history: '使用历史',
        noHistory: '尚未记录使用历史',
      },
      actions: {
        startUsing: '开始使用',
        endUsage: '结束使用',
        notAvailable: '不可用',
      },
      labels: {
        usagePeriod: '使用期间',
        started: '开始日期',
        ended: '结束日期',
        duration: '持续时间',
        active: '使用中',
        notes: '备注',
      },
      status: {
        active: '使用中',
        completed: '已完成',
      },
      empty: {
        title: '暂无使用记录',
        description: '开始使用被子后，记录将显示在这里',
      },
      edit: {
        title: '编辑使用记录',
        startDate: '开始日期',
        endDate: '结束日期',
        usageType: '使用类型',
        notes: '备注',
        pickDate: '选择日期',
        pickDateOptional: '选择日期（可选）',
        leaveEmptyIfActive: '如果仍在使用请留空',
        selectUsageType: '选择使用类型',
        addNotes: '添加关于此使用期间的备注...',
        saveChanges: '保存更改',
        saving: '保存中...',
        confirmDelete: '确认删除',
        updated: '使用记录更新成功',
        deleted: '使用记录删除成功',
        updateFailed: '更新使用记录失败',
        deleteFailed: '删除使用记录失败',
        dateError: '开始日期不能晚于结束日期',
        regularUse: '常规使用',
        guestUse: '客人使用',
        specialOccasion: '特殊场合',
        seasonalRotation: '季节轮换',
      },
    },

    // 设置
    settings: {
      title: '系统设置',
      subtitle: '管理您的应用程序偏好设置',
      sections: {
        app: {
          title: '应用程序设置',
          description: '配置常规应用程序偏好设置',
          applicationName: '应用程序名称',
          language: '语言',
        },
        database: {
          title: '数据库',
          description: '数据库连接和配置',
          provider: '数据库提供商',
          connectionStatus: '连接状态',
          connected: '已连接',
          totalRecords: '总记录数',
        },
        notifications: {
          title: '通知',
          description: '管理通知偏好设置',
          usageReminders: '使用提醒',
          usageRemindersDesc: '获取被子使用模式通知',
          maintenanceAlerts: '维护警报',
          maintenanceAlertsDesc: '接收维护提醒',
        },
        system: {
          title: '系统信息',
          version: '版本',
          framework: '框架',
          deployment: '部署',
        },
      },
      actions: {
        save: '保存设置',
        saved: '设置已保存！',
        saveSuccess: '设置保存成功！',
      },
    },

    // 状态
    status: {
      AVAILABLE: '可用',
      IN_USE: '使用中',
      STORAGE: '存储中',
      MAINTENANCE: '维护中',
    },

    // 季节
    season: {
      WINTER: '冬季',
      SPRING_AUTUMN: '春秋',
      SUMMER: '夏季',
    },

    // 分析
    analytics: {
      title: '数据分析',
      subtitle: '被子使用情况分析和趋势',
      comingSoon: '即将推出',
      description: '这个页面将显示详细的使用分析和趋势图表。',
      totalQuilts: '被子总数',
      usageRecords: '使用记录',
      totalUsageDays: '总使用天数',
      avgUsageDays: '平均使用天数',
      statusDistribution: '状态分布',
      seasonDistribution: '季节分布',
      mostUsedQuilts: '最常使用的被子',
      topByUsageCount: '按使用次数排序的前5名',
      usageTrendByYear: '年度使用趋势',
      avg: '平均',
      days: '天',
      uses: '次',
    },

    // 维护
    maintenance: {
      title: '维护',
      subtitle: '被子护理和维护记录',
      comingSoon: '即将推出',
      description: '这个页面将帮助您跟踪被子的护理和维护历史。',
    },

    // 报告
    reports: {
      title: '导入导出',
      subtitle: '批量导入和导出被子数据',
      comingSoon: '即将推出',
      description: '这个页面将提供各种报告和数据导出功能。',
      exportOptions: '导出选项',
      selectFormatAndDownload: '选择报告格式并下载数据',
      exportButton: '导出',
      dataBackup: '数据备份',
      fullBackup: '完整备份',
      inventoryReport: '库存报告',
      quiltCollectionStatus: '被子收藏和状态报告',
      fullInventoryList: '完整库存清单',
      byStatus: '按状态分类',
      usageReport: '使用报告',
      usageAnalysis: '使用情况和趋势分析',
      usageHistory: '使用历史报告',
      analyticsReport: '分析报告',
      tabs: {
        export: '导出',
        import: '导入',
      },
      export: {
        title: '导出选项',
        description: '选择导出格式',
        downloadFailed: '下载失败',
      },
      import: {
        title: '导入数据',
        description: '从Excel文件导入被子数据',
      },
      quickActions: '快速操作',
      oneClickDownload: '一键下载常用报告',
      inventory: '库存',
      usage: '使用',
      analysis: '分析',
      status: '状态',
    },

    // 天气
    weather: {
      clear: '晴朗',
      mostlyClear: '大部晴朗',
      partlyCloudy: '部分多云',
      overcast: '阴天',
      foggy: '有雾',
      rime: '雾凇',
      lightDrizzle: '小雨',
      moderateDrizzle: '中雨',
      heavyDrizzle: '大雨',
      lightRain: '小雨',
      moderateRain: '中雨',
      heavyRain: '大雨',
      lightSnow: '小雪',
      moderateSnow: '中雪',
      heavySnow: '大雪',
      lightShowers: '阵雨',
      moderateShowers: '中阵雨',
      heavyShowers: '大阵雨',
      thunderstorm: '雷暴',
      thunderstormWithHail: '雷暴伴冰雹',
      severeThunderstorm: '强雷暴伴冰雹',
      unknown: '未知',
      unavailable: '无法获取',
      failedToFetch: '获取天气数据失败',
      cached: '缓存',
      minutes: '分钟',
    },

    // 通知
    notifications: {
      title: '通知历史',
      markAllAsRead: '全部标记为已读',
      clearAll: '清空全部',
      noNotifications: '暂无通知',
      stillOffline: '仍然离线',
    },

    // 错误边界
    errorBoundary: {
      title: '出错了',
      message: '应用程序遇到了意外错误',
      suggestion: '请尝试刷新页面或返回首页',
      retry: '重试',
      refreshPage: '刷新页面',
      backToHome: '返回首页',
      unexpectedError: '发生意外错误',
    },

    // 页面特定
    pages: {
      currentlyInUse: '当前在用被子',
      noQuiltsInUse: '暂无在用被子',
      historicalUsage: '往年今日在用被子',
      fillMaterial: '填充物',
      weight: '重量',
      location: '位置',
      viewDetails: '查看详情',
      noHistoricalRecords: '暂无历史使用记录',
    },

    // UI组件
    ui: {
      sortBy: '排序方式',
      selectSeason: '选择季节',
      selectStatus: '选择状态',
      selectLocation: '选择位置',
      selectBrand: '选择品牌',
      selectCondition: '选择状况',
      selectUsageType: '选择使用类型',
      pickDate: '选择日期',
      toggleSidebar: '切换侧边栏',
      pullToRefresh: '下拉刷新',
      releaseToRefresh: '释放刷新',
      backToTop: '返回顶部',
      allSeasons: '所有季节',
      allStatuses: '所有状态',
      filterByLocation: '按位置筛选',
    },

    // 表单
    forms: {
      essentialDetails: '基本详情',
      specifications: '规格',
      notesAndImages: '备注和图片',
      additionalNotes: '其他备注信息...',
      initialObservations: '初始观察或使用原因...',
      heavyQuiltsForCold: '适合寒冷天气的厚被子',
      mediumWeightTransitional: '适合过渡季节的中等重量',
      lightQuiltsForWarm: '适合温暖天气的轻被子',
      readyForUse: '可以使用',
      currentlyBeingUsed: '正在使用中',
      storedAway: '已存放',
      needsCareOrRepair: '需要护理或维修',
    },

    // 使用跟踪特定
    usageTracking: {
      usedByGuests: '客人或访客使用',
      specialEvents: '特殊活动或场合',
      seasonalRotation: '季节轮换或存储',
      someWear: '有些磨损但仍可用',
      requiresWashing: '需要清洗或清洁',
      requiresMaintenance: '需要维护或维修',
      inUse: '使用中',
      completed: '已完成',
    },

    // 季节性建议
    seasonal: {
      switchToHeavyQuilt: '切换到厚被子',
      switchToLightQuilt: '切换到轻被子',
      useBreathableQuilt: '使用透气被子',
      checkStorageConditions: '检查存储条件',
      useWinterQuilt: '使用冬季被子',
      prepareForTrend: '为趋势做准备',
      coldAndDry: '寒冷干燥',
      hotAndHumid: '炎热潮湿',
      mildAndComfortable: '温和舒适',
      goodTransitionalChoice: '良好的过渡选择',
      heavyWeightForCold: '适合寒冷天气的重量',
      lightWeightForWarm: '适合温暖天气的重量',
      mediumWeightModerate: '适合温和温度的中等重量',
      matchesMaterialPreference: '符合您的材料偏好',
      downMayRetainMoisture: '羽绒在高湿度下可能保持水分',
      cottonBreathesWell: '棉在干燥条件下透气性好',
    },

    // 仪表板特定
    dashboardSpecific: {
      overviewAndStats: '概览和统计',
      manageCollection: '管理您的收藏',
      trackUsagePeriods: '跟踪使用期间',
      usageInsightsAndTrends: '使用见解和趋势',
      exportAndReporting: '导入和导出数据',
      appConfiguration: '应用配置',
      registerNewQuilt: '在您的收藏中注册新被子',
      beginTrackingUsage: '开始跟踪被子使用',
      exploreUsagePatterns: '探索使用模式和见解',
      scheduleQuiltCare: '安排被子护理和清洁',
      createReports: '创建使用和库存报告',
      generateReport: '生成报告',
      viewSeasonalDetails: '查看季节详情',
      viewUsageTrends: '查看使用趋势',
      startedUsing: '开始使用',
      finishedUsing: '完成使用',
      mostUsed: '最常用',
      overview: '概览',
      alerts: '警报',
    },

    // 移动端特定
    mobile: {
      quilts: '被子',
      searchQuilts: '搜索被子...',
      tryAdjustingSearch: '尝试调整搜索或筛选',
      addFirstQuiltToStart: '添加您的第一床被子开始',
      quiltManagementSystem: '被子管理系统',
      overviewAndStatistics: '概览和统计',
      manageYourCollection: '管理您的收藏',
      trackQuiltUsage: '跟踪被子使用',
      seasonalInsights: '季节性见解',
    },

    // 导入导出
    importExport: {
      import: '导入',
      export: '导出',
      importData: '导入数据',
      exportData: '导出数据',
      importFromExcel: '从 Excel 文件导入被子数据',
      exportToExcel: '导出为 Excel',
      exportToCsv: '导出为 CSV',
      exportToJson: '导出为 JSON',
      selectFile: '选择文件',
      dataPreview: '数据预览',
      batchImport: '批量导入',
      fileUploaded: '文件已上传',
      uploadFailed: '上传失败',
      previewFailed: '预览失败',
      importCompleted: '导入完成',
      importFailed: '导入失败',
      exportCompleted: '导出完成',
      exportFailed: '导出失败',
      downloadFailed: '下载失败',
      invalidFileType: '无效的文件类型',
      fileTooLarge: '文件太大',
      supportedFormats: '支持 .xlsx 和 .xls 格式',
      previewAndValidate: '导入前预览和验证数据',
      importMultipleRecords: '一次性导入多个被子记录',
      exportFullInventory: '导出完整的被子库存清单',
      exportToCsvFormat: '导出数据到 CSV 格式，便于其他工具使用',
      exportToJsonFormat: '导出原始数据到 JSON 格式',
      failedToProcessFile: '处理上传文件失败',
      failedToReadFile: '读取上传文件失败',
      failedToDownloadFile: '下载导出文件失败',
    },

    // 导入流程
    importProcess: {
      title: '导入被子',
      description: '从 Excel 文件导入被子数据',
      processTitle: '导入流程',
      processDescription: '按照以下步骤导入您的被子数据',
      steps: {
        upload: '上传',
        preview: '预览',
        results: '结果',
      },
      status: {
        completed: '已完成',
        current: '当前',
        upcoming: '待处理',
      },
      loading: {
        preview: '加载预览中...',
        results: '加载结果中...',
      },
    },

    // 季节智能
    seasonalIntelligence: {
      title: '季节智能',
      description: '智能推荐和见解，帮助您选择最佳被子',
      currentSeason: '当前季节',
      overview: '当前季节被子收藏概览',
      seasonQuilts: '季节被子',
      availableNow: '当前可用',
      totalUses: '总使用次数',
      collectionOverview: '收藏概览',
      current: '当前',
      inactive: '非活跃',
      allTime: '全部时间',
      tabs: {
        recommendations: '推荐',
        weather: '天气',
        patterns: '模式',
        insights: '见解',
      },
      emptyState: {
        title: '您的收藏中没有被子',
        description: '添加一些被子到您的收藏中，以获得个性化的季节推荐和见解。',
      },
      patternAnalysis: {
        title: '使用模式分析',
        comingSoon: '即将推出 - 高级使用模式分析',
        placeholder: '模式分析即将推出',
      },
      smartInsights: {
        title: '智能见解',
        description: '基于您的使用模式的 AI 驱动见解和推荐',
      },
      customizePreferences: '自定义偏好',
    },

    // 确认消息
    confirmations: {
      deleteQuilt: '确定要删除"{name}"吗？此操作无法撤销。',
      deleteMultipleQuilts: '确定要删除选中的 {count} 床被子吗？此操作无法撤销。',
    },

    // Toast 消息
    toasts: {
      usageStarted: '使用已开始',
      startedUsing: '开始使用 {name}',
      failedToStartUsage: '开始使用失败',
      usageEnded: '使用已结束',
      stoppedUsing: '停止使用 {name}',
      failedToEndUsage: '结束使用失败',
      quiltDeleted: '被子已删除',
      removedFromCollection: '{name} 已从您的收藏中移除',
      failedToDeleteQuilt: '删除被子失败',
    },

    // 通用操作
    actions: {
      creating: '正在创建',
      updating: '正在更新',
      deleting: '正在删除',
      saving: '正在保存',
      loading: '加载中',
      importing: '正在导入',
      exporting: '正在导出',
      createdSuccessfully: '创建成功',
      updatedSuccessfully: '更新成功',
      deletedSuccessfully: '删除成功',
      savedSuccessfully: '保存成功',
      importedSuccessfully: '导入成功',
      exportedSuccessfully: '导出成功',
      failedToCreate: '创建失败',
      failedToUpdate: '更新失败',
      failedToDelete: '删除失败',
      failedToSave: '保存失败',
      failedToImport: '导入失败',
      failedToExport: '导出失败',
      networkError: '网络错误',
      unknownError: '未知错误',
      noChanges: '没有更改',
      pleaseSelectItems: '请选择项目',
      confirmDelete: '确认删除',
      pleaseTryAgain: '请重试',
      usageStarted: '使用已开始',
      usageEnded: '使用已结束',
      failedToStartUsage: '开始使用失败',
      failedToEndUsage: '结束使用失败',
      quiltDeleted: '被子已删除',
      failedToDeleteQuilt: '删除被子失败',
      quiltUpdated: '被子已更新',
      quiltCreated: '被子已创建',
      failedToUpdateQuilt: '更新被子失败',
      failedToCreateQuilt: '创建被子失败',
    },

    // 验证消息
    validation: {
      required: '必填项',
      invalidFormat: '格式无效',
      tooLong: '太长',
      tooShort: '太短',
      mustBePositive: '必须为正数',
      itemNumberMustBePositive: '编号必须为正数',
      nameRequired: '名称必填',
      nameTooLong: '名称太长',
      lengthMustBePositive: '长度必须为正数',
      widthMustBePositive: '宽度必须为正数',
      weightMustBePositive: '重量必须为正数',
      fillMaterialRequired: '填充物必填',
      colorRequired: '颜色必填',
      locationRequired: '位置必填',
      maintenanceTypeRequired: '维护类型必填',
      descriptionRequired: '描述必填',
    },

    // 空状态
    emptyStates: {
      noQuiltsYet: '暂无被子数据',
      noQuiltsFound: '未找到被子',
      noUsageHistory: '暂无历史使用记录',
      noNotifications: '暂无通知',
      noLocation: '无位置',
      noData: '暂无数据',
      tryAdjustingFilters: '尝试调整搜索或筛选条件',
      addFirstQuilt: '添加您的第一床被子开始使用',
    },

    // 对话框和确认
    dialogs: {
      areYouSure: '确定吗',
      confirmDeleteQuilt: '确定要删除被子',
      confirmDeleteMultiple: '确定要删除选中的',
      items: '个被子吗',
      deletingItems: '正在删除',
      successfullyDeleted: '成功删除',
      selectAll: '全选',
      deselectAll: '取消全选',
    },

    // 通用
    common: {
      loading: '加载中...',
      error: '错误',
      save: '保存',
      cancel: '取消',
      edit: '编辑',
      delete: '删除',
      view: '查看',
      add: '添加',
      search: '搜索',
      notes: '备注',
      comingSoon: '即将推出',
      back: '返回',
      yes: '是',
      no: '否',
      ok: '确定',
      close: '关闭',
      confirm: '确认',
      retry: '重试',
      refresh: '刷新',
      clear: '清除',
      viewDetails: '查看详情',
      backToHome: '返回首页',
      use: '使用',
      stop: '停止',
      startUsing: '开始使用',
      stopUsing: '停止使用',
      pleaseTryAgain: '请重试',
      today: '今天',
      neverUsed: '从未使用',
      inUseSince: '自 {date} 起使用',
      lastUsed: '上次使用',
      daysAgo: '{days} 天前',
      openSidebar: '打开侧边栏',
      viewNotifications: '查看通知',
      quiltManagement: '被子管理',
      version: '版本',
      failedToLogout: '退出登录失败。请重试。',
    },
  },
  en: {
    // Authentication
    auth: {
      login: 'Login',
      logout: 'Logout',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me (30 days)',
      loginTitle: 'QMS Quilt Management System',
      loginSubtitle: 'Please login to continue',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      invalidPassword: 'Invalid password',
      tooManyAttempts: 'Too many attempts. Please try again in 15 minutes',
      sessionExpired: 'Session expired. Please login again',
      loginSuccess: 'Login successful',
      logoutSuccess: 'Logged out successfully',
      logoutConfirm: 'Are you sure you want to logout?',
    },

    // Navigation and Common
    navigation: {
      dashboard: 'Dashboard',
      quilts: 'Quilts',
      usage: 'Usage Tracking',
      analytics: 'Data Analytics',
      maintenance: 'Maintenance',
      reports: 'Import/Export',
      settings: 'System Settings',
    },

    // 仪表板
    dashboard: {
      title: 'Dashboard',
      subtitle: '',
      stats: {
        totalQuilts: 'Total Quilts',
        inUse: 'In Use',
        available: 'Available',
        storage: 'Storage',
        maintenance: 'Maintenance',
      },
      seasonal: {
        title: 'Seasonal Distribution',
        winter: 'Winter',
        springAutumn: 'Spring/Autumn',
        summer: 'Summer',
      },
      actions: {
        title: 'Quick Actions',
        viewQuilts: 'View Quilts',
        usageTracking: 'Usage Tracking',
        importData: 'Import Data',
        exportData: 'Export Data',
      },
      success: {
        title: 'Success!',
        message: 'QMS application is running and dashboard data loaded successfully.',
      },
    },

    // 被子管理
    quilts: {
      title: 'Quilt Collection',
      subtitle: 'Manage your quilts and track their usage',
      actions: {
        add: 'Add Quilt',
        addFirst: 'Add Your First Quilt',
        search: 'Search quilts...',
      },
      views: {
        card: 'Cards',
        list: 'List',
        name: 'Name',
        actions: 'Actions',
      },
      table: {
        itemNumber: 'Item #',
        season: 'Season',
        size: 'Size',
        weight: 'Weight',
        material: 'Material',
        color: 'Color',
        location: 'Location',
        status: 'Status',
      },
      form: {
        name: 'Name',
        length: 'Length (cm)',
        width: 'Width (cm)',
        color: 'Color',
        brand: 'Brand',
        materialDetails: 'Material Details',
        namePlaceholder: 'e.g., Winter Down Comforter',
        colorPlaceholder: 'White',
        materialPlaceholder: 'Down',
        brandPlaceholder: 'Brand Name',
        locationPlaceholder: 'Bedroom Closet',
        materialDetailsPlaceholder: 'Detailed material information...',
        notesPlaceholder: 'Additional notes...',
      },
      messages: {
        noQuiltsFound: 'No quilts found',
        showing: 'Showing',
        of: 'of',
        quilts: 'quilts',
      },
      dialogs: {
        addTitle: 'Add Quilt',
        editTitle: 'Edit Quilt',
        addDesc: 'Add a new quilt to your collection',
        editDesc: 'Edit quilt information',
        changeStatus: 'Change Status',
        changeStatusDesc: 'Change status for quilt "{name}"',
        currentStatus: 'Current Status',
        newStatus: 'New Status',
      },
    },

    // 使用跟踪
    usage: {
      title: 'Usage Tracking',
      subtitle: 'Monitor and track quilt usage',
      selection: {
        title: 'Select Quilt to Track',
        description: 'Choose a quilt to view and manage its usage',
        prompt: 'Select a quilt from the list above to view and track its usage',
      },
      details: {
        title: 'Usage Details',
        actions: 'Usage Actions',
        history: 'Usage History',
        noHistory: 'No usage history recorded yet',
      },
      actions: {
        startUsing: 'Start Using',
        endUsage: 'End Usage',
        notAvailable: 'Not Available',
      },
      labels: {
        usagePeriod: 'Usage Period',
        started: 'Start Date',
        ended: 'End Date',
        duration: 'Duration',
        active: 'Active',
        notes: 'Notes',
      },
      status: {
        active: 'Active',
        completed: 'Completed',
      },
      empty: {
        title: 'No usage records',
        description: 'Usage records will appear here once you start tracking',
      },
      edit: {
        title: 'Edit Usage Record',
        startDate: 'Start Date',
        endDate: 'End Date',
        usageType: 'Usage Type',
        notes: 'Notes',
        pickDate: 'Pick a date',
        pickDateOptional: 'Pick a date (optional)',
        leaveEmptyIfActive: 'Leave empty if still in use',
        selectUsageType: 'Select usage type',
        addNotes: 'Add notes about this usage period...',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        confirmDelete: 'Confirm Delete',
        updated: 'Usage record updated successfully',
        deleted: 'Usage record deleted successfully',
        updateFailed: 'Failed to update usage record',
        deleteFailed: 'Failed to delete usage record',
        dateError: 'Start date cannot be after end date',
        regularUse: 'Regular Use',
        guestUse: 'Guest Use',
        specialOccasion: 'Special Occasion',
        seasonalRotation: 'Seasonal Rotation',
      },
    },

    // 设置
    settings: {
      title: 'System Settings',
      subtitle: 'Manage your application preferences',
      sections: {
        app: {
          title: 'Application Settings',
          description: 'Configure general application preferences',
          applicationName: 'Application Name',
          language: 'Language',
        },
        database: {
          title: 'Database',
          description: 'Database connection and configuration',
          provider: 'Database Provider',
          connectionStatus: 'Connection Status',
          connected: 'Connected',
          totalRecords: 'Total Records',
        },
        notifications: {
          title: 'Notifications',
          description: 'Manage notification preferences',
          usageReminders: 'Usage Reminders',
          usageRemindersDesc: 'Get notified about quilt usage patterns',
          maintenanceAlerts: 'Maintenance Alerts',
          maintenanceAlertsDesc: 'Receive maintenance reminders',
        },
        system: {
          title: 'System Information',
          version: 'Version',
          framework: 'Framework',
          deployment: 'Deployment',
        },
      },
      actions: {
        save: 'Save Settings',
        saved: 'Settings Saved!',
        saveSuccess: 'Settings saved successfully!',
      },
    },

    // 状态
    status: {
      AVAILABLE: 'Available',
      IN_USE: 'In Use',
      STORAGE: 'Storage',
      MAINTENANCE: 'Maintenance',
    },

    // 季节
    season: {
      WINTER: 'Winter',
      SPRING_AUTUMN: 'Spring/Autumn',
      SUMMER: 'Summer',
    },

    // 分析
    analytics: {
      title: 'Data Analytics',
      subtitle: 'Quilt usage analytics and trends',
      comingSoon: 'Coming Soon',
      description: 'This page will display detailed usage analytics and trend charts.',
      totalQuilts: 'Total Quilts',
      usageRecords: 'Usage Records',
      totalUsageDays: 'Total Usage Days',
      avgUsageDays: 'Avg Usage Days',
      statusDistribution: 'Status Distribution',
      seasonDistribution: 'Season Distribution',
      mostUsedQuilts: 'Most Used Quilts',
      topByUsageCount: 'Top 5 by usage count',
      usageTrendByYear: 'Usage Trend by Year',
      avg: 'Avg',
      days: 'days',
      uses: 'uses',
    },

    // 维护
    maintenance: {
      title: 'Maintenance',
      subtitle: 'Quilt care and maintenance records',
      comingSoon: 'Coming Soon',
      description: 'This page will help you track quilt care and maintenance history.',
    },

    // Reports
    reports: {
      title: 'Import/Export',
      subtitle: 'Batch import and export quilt data',
      comingSoon: 'Coming Soon',
      description: 'This page will provide various reporting and data export features.',
      exportOptions: 'Export Options',
      selectFormatAndDownload: 'Select report format and download data',
      exportButton: 'Export',
      dataBackup: 'Data Backup',
      fullBackup: 'Full Backup',
      inventoryReport: 'Inventory Report',
      quiltCollectionStatus: 'Quilt collection and status report',
      fullInventoryList: 'Full Inventory List',
      byStatus: 'By Status',
      usageReport: 'Usage Report',
      usageAnalysis: 'Usage and trend analysis',
      usageHistory: 'Usage History Report',
      analyticsReport: 'Analytics Report',
      tabs: {
        export: 'Export',
        import: 'Import',
      },
      export: {
        title: 'Export Options',
        description: 'Choose export format',
        downloadFailed: 'Download failed',
      },
      import: {
        title: 'Import Data',
        description: 'Import quilt data from Excel file',
      },
      quickActions: 'Quick Actions',
      oneClickDownload: 'One-click download common reports',
      inventory: 'Inventory',
      usage: 'Usage',
      analysis: 'Analysis',
      status: 'Status',
    },

    // Weather
    weather: {
      clear: 'Clear',
      mostlyClear: 'Mostly Clear',
      partlyCloudy: 'Partly Cloudy',
      overcast: 'Overcast',
      foggy: 'Foggy',
      rime: 'Rime',
      lightDrizzle: 'Light Drizzle',
      moderateDrizzle: 'Moderate Drizzle',
      heavyDrizzle: 'Heavy Drizzle',
      lightRain: 'Light Rain',
      moderateRain: 'Moderate Rain',
      heavyRain: 'Heavy Rain',
      lightSnow: 'Light Snow',
      moderateSnow: 'Moderate Snow',
      heavySnow: 'Heavy Snow',
      lightShowers: 'Light Showers',
      moderateShowers: 'Moderate Showers',
      heavyShowers: 'Heavy Showers',
      thunderstorm: 'Thunderstorm',
      thunderstormWithHail: 'Thunderstorm with Hail',
      severeThunderstorm: 'Severe Thunderstorm with Hail',
      unknown: 'Unknown',
      unavailable: 'Unavailable',
      failedToFetch: 'Failed to Fetch Weather Data',
      cached: 'Cached',
      minutes: 'Minutes',
    },

    // Notifications
    notifications: {
      title: 'Notification History',
      markAllAsRead: 'Mark All as Read',
      clearAll: 'Clear All',
      noNotifications: 'No Notifications',
      stillOffline: 'Still Offline',
    },

    // Error Boundary
    errorBoundary: {
      title: 'Something Went Wrong',
      message: 'The application encountered an unexpected error',
      suggestion: 'Please try refreshing the page or returning to the home page',
      retry: 'Retry',
      refreshPage: 'Refresh Page',
      backToHome: 'Back to Home',
      unexpectedError: 'An Unexpected Error Occurred',
    },

    // Page Specific
    pages: {
      currentlyInUse: 'Currently in Use',
      noQuiltsInUse: 'No Quilts Currently in Use',
      historicalUsage: 'Historical Usage on This Day',
      fillMaterial: 'Fill Material',
      weight: 'Weight',
      location: 'Location',
      viewDetails: 'View Details',
      noHistoricalRecords: 'No Historical Usage Records',
    },

    // UI Components
    ui: {
      sortBy: 'Sort By',
      selectSeason: 'Select Season',
      selectStatus: 'Select Status',
      selectLocation: 'Select Location',
      selectBrand: 'Select Brand',
      selectCondition: 'Select Condition',
      selectUsageType: 'Select Usage Type',
      pickDate: 'Pick a Date',
      toggleSidebar: 'Toggle Sidebar',
      pullToRefresh: 'Pull to Refresh',
      releaseToRefresh: 'Release to Refresh',
      backToTop: 'Back to Top',
      allSeasons: 'All Seasons',
      allStatuses: 'All Statuses',
      filterByLocation: 'Filter by Location',
    },

    // Forms
    forms: {
      essentialDetails: 'Essential Quilt Details',
      specifications: 'Specifications',
      notesAndImages: 'Notes and Images',
      additionalNotes: 'Any additional notes about this quilt...',
      initialObservations: 'Any initial observations or reasons for using this quilt...',
      heavyQuiltsForCold: 'Heavy Quilts for Cold Weather',
      mediumWeightTransitional: 'Medium Weight for Transitional Seasons',
      lightQuiltsForWarm: 'Light Quilts for Warm Weather',
      readyForUse: 'Ready for Use',
      currentlyBeingUsed: 'Currently Being Used',
      storedAway: 'Stored Away',
      needsCareOrRepair: 'Needs Care or Repair',
    },

    // Usage Tracking Specific
    usageTracking: {
      usedByGuests: 'Used by Guests or Visitors',
      specialEvents: 'Special Events or Occasions',
      seasonalRotation: 'Seasonal Rotation or Storage',
      someWear: 'Some Wear but Still Usable',
      requiresWashing: 'Requires Washing or Cleaning',
      requiresMaintenance: 'Requires Maintenance or Repair',
      inUse: 'In Use',
      completed: 'Completed',
    },

    // Seasonal Suggestions
    seasonal: {
      switchToHeavyQuilt: 'Switch to Heavy Quilt',
      switchToLightQuilt: 'Switch to Light Quilt',
      useBreathableQuilt: 'Use Breathable Quilt',
      checkStorageConditions: 'Check Storage Conditions',
      useWinterQuilt: 'Use Winter Quilt',
      prepareForTrend: 'Prepare for Trend',
      coldAndDry: 'Cold and Dry',
      hotAndHumid: 'Hot and Humid',
      mildAndComfortable: 'Mild and Comfortable',
      goodTransitionalChoice: 'Good Transitional Choice',
      heavyWeightForCold: 'Heavy Weight for Cold Weather',
      lightWeightForWarm: 'Light Weight for Warm Weather',
      mediumWeightModerate: 'Medium Weight for Moderate Temperature',
      matchesMaterialPreference: 'Matches Your Material Preference',
      downMayRetainMoisture: 'Down May Retain Moisture in High Humidity',
      cottonBreathesWell: 'Cotton Breathes Well in Dry Conditions',
    },

    // Dashboard Specific
    dashboardSpecific: {
      overviewAndStats: 'Overview and Quick Stats',
      manageCollection: 'Manage Your Quilt Collection',
      trackUsagePeriods: 'Track Quilt Usage Periods',
      usageInsightsAndTrends: 'Usage Insights and Trends',
      exportAndReporting: 'Import and Export Data',
      appConfiguration: 'App Configuration',
      registerNewQuilt: 'Register a New Quilt in Your Collection',
      beginTrackingUsage: 'Begin Tracking Quilt Usage',
      exploreUsagePatterns: 'Explore Usage Patterns and Insights',
      scheduleQuiltCare: 'Schedule Quilt Care and Cleaning',
      createReports: 'Create Usage and Inventory Reports',
      generateReport: 'Generate Report',
      viewSeasonalDetails: 'View Seasonal Details',
      viewUsageTrends: 'View Usage Trends',
      startedUsing: 'Started Using',
      finishedUsing: 'Finished Using',
      mostUsed: 'Most Used',
      overview: 'Overview',
      alerts: 'Alerts',
    },

    // Mobile Specific
    mobile: {
      quilts: 'Quilts',
      searchQuilts: 'Search Quilts...',
      tryAdjustingSearch: 'Try Adjusting Your Search or Filters',
      addFirstQuiltToStart: 'Add Your First Quilt to Get Started',
      quiltManagementSystem: 'Quilt Management System',
      overviewAndStatistics: 'Overview and Statistics',
      manageYourCollection: 'Manage Your Collection',
      trackQuiltUsage: 'Track Quilt Usage',
      seasonalInsights: 'Seasonal Insights',
    },

    // Import/Export
    importExport: {
      import: 'Import',
      export: 'Export',
      importData: 'Import Data',
      exportData: 'Export Data',
      importFromExcel: 'Import quilt data from Excel file',
      exportToExcel: 'Export to Excel',
      exportToCsv: 'Export to CSV',
      exportToJson: 'Export to JSON',
      selectFile: 'Select File',
      dataPreview: 'Data Preview',
      batchImport: 'Batch Import',
      fileUploaded: 'File Uploaded',
      uploadFailed: 'Upload Failed',
      previewFailed: 'Preview Failed',
      importCompleted: 'Import Completed',
      importFailed: 'Import Failed',
      exportCompleted: 'Export Completed',
      exportFailed: 'Export Failed',
      downloadFailed: 'Download Failed',
      invalidFileType: 'Invalid File Type',
      fileTooLarge: 'File Too Large',
      supportedFormats: 'Supports .xlsx and .xls formats',
      previewAndValidate: 'Preview and validate data before import',
      importMultipleRecords: 'Import multiple quilt records at once',
      exportFullInventory: 'Export complete quilt inventory list',
      exportToCsvFormat: 'Export data to CSV format for use with other tools',
      exportToJsonFormat: 'Export raw data to JSON format',
      failedToProcessFile: 'Failed to process the uploaded file',
      failedToReadFile: 'Failed to read the uploaded file',
      failedToDownloadFile: 'Failed to download the exported file',
    },

    // Import Process
    importProcess: {
      title: 'Import Quilts',
      description: 'Import quilt data from Excel files',
      processTitle: 'Import Process',
      processDescription: 'Follow these steps to import your quilt data',
      steps: {
        upload: 'upload',
        preview: 'preview',
        results: 'results',
      },
      status: {
        completed: 'completed',
        current: 'current',
        upcoming: 'upcoming',
      },
      loading: {
        preview: 'Loading preview...',
        results: 'Loading results...',
      },
    },

    // Seasonal Intelligence
    seasonalIntelligence: {
      title: 'Seasonal Intelligence',
      description: 'Smart recommendations and insights for optimal quilt selection',
      currentSeason: 'Current Season',
      overview: 'Overview of your quilt collection for the current season',
      seasonQuilts: 'Season Quilts',
      availableNow: 'Available Now',
      totalUses: 'Total Uses',
      collectionOverview: 'Collection Overview',
      current: 'Current',
      inactive: 'Inactive',
      allTime: 'All Time',
      tabs: {
        recommendations: 'Recommendations',
        weather: 'Weather',
        patterns: 'Patterns',
        insights: 'Insights',
      },
      emptyState: {
        title: 'No quilts in your collection',
        description:
          'Add some quilts to your collection to get personalized seasonal recommendations and insights.',
      },
      patternAnalysis: {
        title: 'Usage Pattern Analysis',
        comingSoon: 'Coming soon - Advanced usage pattern analysis',
        placeholder: 'Pattern analysis will be available soon',
      },
      smartInsights: {
        title: 'Smart Insights',
        description: 'AI-powered insights and recommendations based on your usage patterns',
      },
      customizePreferences: 'Customize Preferences',
    },

    // Confirmations
    confirmations: {
      deleteQuilt: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
      deleteMultipleQuilts:
        'Are you sure you want to delete {count} selected quilts? This action cannot be undone.',
    },

    // Toast Messages
    toasts: {
      usageStarted: 'Usage started',
      startedUsing: 'Started using {name}',
      failedToStartUsage: 'Failed to start usage',
      usageEnded: 'Usage ended',
      stoppedUsing: 'Stopped using {name}',
      failedToEndUsage: 'Failed to end usage',
      quiltDeleted: 'Quilt deleted',
      removedFromCollection: '{name} has been removed from your collection',
      failedToDeleteQuilt: 'Failed to delete quilt',
    },

    // Actions
    actions: {
      creating: 'Creating',
      updating: 'Updating',
      deleting: 'Deleting',
      saving: 'Saving',
      loading: 'Loading',
      importing: 'Importing',
      exporting: 'Exporting',
      createdSuccessfully: 'Created Successfully',
      updatedSuccessfully: 'Updated Successfully',
      deletedSuccessfully: 'Deleted Successfully',
      savedSuccessfully: 'Saved Successfully',
      importedSuccessfully: 'Imported Successfully',
      exportedSuccessfully: 'Exported Successfully',
      failedToCreate: 'Failed to Create',
      failedToUpdate: 'Failed to Update',
      failedToDelete: 'Failed to Delete',
      failedToSave: 'Failed to Save',
      failedToImport: 'Failed to Import',
      failedToExport: 'Failed to Export',
      networkError: 'Network Error',
      unknownError: 'Unknown Error',
      noChanges: 'No Changes',
      pleaseSelectItems: 'Please Select Items',
      confirmDelete: 'Confirm Delete',
      pleaseTryAgain: 'Please Try Again',
      usageStarted: 'Usage Started',
      usageEnded: 'Usage Ended',
      failedToStartUsage: 'Failed to Start Usage',
      failedToEndUsage: 'Failed to End Usage',
      quiltDeleted: 'Quilt Deleted',
      failedToDeleteQuilt: 'Failed to Delete Quilt',
      quiltUpdated: 'Quilt Updated',
      quiltCreated: 'Quilt Created',
      failedToUpdateQuilt: 'Failed to Update Quilt',
      failedToCreateQuilt: 'Failed to Create Quilt',
    },

    // Validation Messages
    validation: {
      required: 'Required',
      invalidFormat: 'Invalid Format',
      tooLong: 'Too Long',
      tooShort: 'Too Short',
      mustBePositive: 'Must Be Positive',
      itemNumberMustBePositive: 'Item Number Must Be Positive',
      nameRequired: 'Name is Required',
      nameTooLong: 'Name Too Long',
      lengthMustBePositive: 'Length Must Be Positive',
      widthMustBePositive: 'Width Must Be Positive',
      weightMustBePositive: 'Weight Must Be Positive',
      fillMaterialRequired: 'Fill Material is Required',
      colorRequired: 'Color is Required',
      locationRequired: 'Location is Required',
      maintenanceTypeRequired: 'Maintenance Type is Required',
      descriptionRequired: 'Description is Required',
    },

    // Empty States
    emptyStates: {
      noQuiltsYet: 'No Quilts Yet',
      noQuiltsFound: 'No Quilts Found',
      noUsageHistory: 'No Historical Usage Records',
      noNotifications: 'No Notifications',
      noLocation: 'No Location',
      noData: 'No Data Available',
      tryAdjustingFilters: 'Try Adjusting Your Search or Filters',
      addFirstQuilt: 'Add Your First Quilt to Get Started',
    },

    // Dialogs and Confirmations
    dialogs: {
      areYouSure: 'Are You Sure',
      confirmDeleteQuilt: 'Are You Sure You Want to Delete Quilt',
      confirmDeleteMultiple: 'Are You Sure You Want to Delete',
      items: 'Items',
      deletingItems: 'Deleting',
      successfullyDeleted: 'Successfully Deleted',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      add: 'Add',
      search: 'Search',
      notes: 'Notes',
      comingSoon: 'Coming Soon',
      back: 'Back',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      confirm: 'Confirm',
      retry: 'Retry',
      refresh: 'Refresh',
      clear: 'Clear',
      viewDetails: 'View Details',
      backToHome: 'Back to Home',
      use: 'Use',
      stop: 'Stop',
      startUsing: 'Start Using',
      stopUsing: 'Stop Using',
      pleaseTryAgain: 'Please try again',
      today: 'today',
      neverUsed: 'Never used',
      inUseSince: 'In use since {date}',
      lastUsed: 'Last used',
      daysAgo: '{days} days ago',
      openSidebar: 'Open sidebar',
      viewNotifications: 'View notifications',
      quiltManagement: 'Quilt Management',
      version: 'Version',
      failedToLogout: 'Failed to logout. Please try again.',
    },
  },
};

// 嵌套翻译键解析函数
export function getNestedTranslation(
  obj: Record<string, unknown>,
  key: string
): string | undefined {
  const keys = key.split('.');
  let current: unknown = obj;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

// 向后兼容的翻译函数（已弃用）
export function useTranslation(lang: Language = 'zh') {
  console.warn('useTranslation is deprecated. Use useLanguage hook instead.');
  return translations[lang];
}
