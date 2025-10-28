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
    // 导航和通用
    navigation: {
      dashboard: '仪表板',
      quilts: '被子管理',
      usage: '使用跟踪',
      analytics: '分析',
      maintenance: '维护',
      reports: '报告',
      settings: '设置',
    },
    
    // 仪表板
    dashboard: {
      title: '被子管理系统',
      subtitle: '管理您的被子收藏和使用情况',
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
        location: '位置',
        status: '状态',
      },
      form: {
        length: '长度 (cm)',
        width: '宽度 (cm)',
        color: '颜色',
        brand: '品牌',
        materialDetails: '材料详情',
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
        started: '开始时间',
        ended: '结束时间',
        active: '使用中',
        notes: '备注',
      },
    },
    
    // 设置
    settings: {
      title: '设置',
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
      title: '分析',
      subtitle: '被子使用情况分析和趋势',
      comingSoon: '即将推出',
      description: '这个页面将显示详细的使用分析和趋势图表。',
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
      title: '报告',
      subtitle: '导出和报告功能',
      comingSoon: '即将推出',
      description: '这个页面将提供各种报告和数据导出功能。',
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
    },
  },
  en: {
    // 导航和通用
    navigation: {
      dashboard: 'Dashboard',
      quilts: 'Quilts',
      usage: 'Usage Tracking',
      analytics: 'Analytics',
      maintenance: 'Maintenance',
      reports: 'Reports',
      settings: 'Settings',
    },
    
    // 仪表板
    dashboard: {
      title: 'Quilt Management System',
      subtitle: 'Manage your quilt collection and track usage',
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
        location: 'Location',
        status: 'Status',
      },
      form: {
        length: 'Length (cm)',
        width: 'Width (cm)',
        color: 'Color',
        brand: 'Brand',
        materialDetails: 'Material Details',
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
        started: 'Started',
        ended: 'Ended',
        active: 'Active',
        notes: 'Notes',
      },
    },
    
    // 设置
    settings: {
      title: 'Settings',
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
      title: 'Analytics',
      subtitle: 'Quilt usage analytics and trends',
      comingSoon: 'Coming Soon',
      description: 'This page will display detailed usage analytics and trend charts.',
    },

    // 维护
    maintenance: {
      title: 'Maintenance',
      subtitle: 'Quilt care and maintenance records',
      comingSoon: 'Coming Soon',
      description: 'This page will help you track quilt care and maintenance history.',
    },

    // 报告
    reports: {
      title: 'Reports',
      subtitle: 'Export and reporting features',
      comingSoon: 'Coming Soon',
      description: 'This page will provide various reporting and data export features.',
    },

    // 通用
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
    },
  },
};

// 嵌套翻译键解析函数
export function getNestedTranslation(obj: any, key: string): string | undefined {
  const keys = key.split('.');
  let current = obj;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
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