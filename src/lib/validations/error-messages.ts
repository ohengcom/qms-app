/**
 * Bilingual Validation Error Messages
 * Provides consistent error messages in both Chinese and English
 */

import type { Language } from '../i18n';

/**
 * Validation error message keys and their translations
 */
export const validationMessages = {
  // Required field errors
  required: {
    zh: '此字段为必填项',
    en: 'This field is required',
  },

  // String validation
  stringTooShort: {
    zh: '输入内容太短',
    en: 'Input is too short',
  },
  stringTooLong: {
    zh: '输入内容太长',
    en: 'Input is too long',
  },
  invalidFormat: {
    zh: '格式无效',
    en: 'Invalid format',
  },

  // Number validation
  numberTooSmall: {
    zh: '数值太小',
    en: 'Number is too small',
  },
  numberTooLarge: {
    zh: '数值太大',
    en: 'Number is too large',
  },
  mustBePositive: {
    zh: '必须为正数',
    en: 'Must be a positive number',
  },
  mustBeInteger: {
    zh: '必须为整数',
    en: 'Must be an integer',
  },

  // Quilt-specific validation
  quilt: {
    itemNumberRequired: {
      zh: '编号为必填项',
      en: 'Item number is required',
    },
    itemNumberPositive: {
      zh: '编号必须为正数',
      en: 'Item number must be positive',
    },
    itemNumberDuplicate: {
      zh: '此编号已存在',
      en: 'This item number already exists',
    },
    nameRequired: {
      zh: '名称为必填项',
      en: 'Name is required',
    },
    nameTooLong: {
      zh: '名称过长（最多100个字符）',
      en: 'Name is too long (max 100 characters)',
    },
    lengthRequired: {
      zh: '长度为必填项',
      en: 'Length is required',
    },
    lengthPositive: {
      zh: '长度必须为正数',
      en: 'Length must be positive',
    },
    widthRequired: {
      zh: '宽度为必填项',
      en: 'Width is required',
    },
    widthPositive: {
      zh: '宽度必须为正数',
      en: 'Width must be positive',
    },
    weightRequired: {
      zh: '重量为必填项',
      en: 'Weight is required',
    },
    weightPositive: {
      zh: '重量必须为正数',
      en: 'Weight must be positive',
    },
    fillMaterialRequired: {
      zh: '填充物为必填项',
      en: 'Fill material is required',
    },
    colorRequired: {
      zh: '颜色为必填项',
      en: 'Color is required',
    },
    locationRequired: {
      zh: '位置为必填项',
      en: 'Location is required',
    },
    seasonRequired: {
      zh: '季节为必填项',
      en: 'Season is required',
    },
    statusRequired: {
      zh: '状态为必填项',
      en: 'Status is required',
    },
    invalidSeason: {
      zh: '无效的季节选项',
      en: 'Invalid season option',
    },
    invalidStatus: {
      zh: '无效的状态选项',
      en: 'Invalid status option',
    },
  },

  // Usage tracking validation
  usage: {
    quiltIdRequired: {
      zh: '被子ID为必填项',
      en: 'Quilt ID is required',
    },
    startDateRequired: {
      zh: '开始日期为必填项',
      en: 'Start date is required',
    },
    endDateInvalid: {
      zh: '结束日期必须晚于开始日期',
      en: 'End date must be after start date',
    },
    dateInFuture: {
      zh: '日期不能是未来时间',
      en: 'Date cannot be in the future',
    },
    alreadyInUse: {
      zh: '该被子已在使用中',
      en: 'This quilt is already in use',
    },
    notInUse: {
      zh: '该被子当前未在使用中',
      en: 'This quilt is not currently in use',
    },
  },

  // Maintenance validation
  maintenance: {
    typeRequired: {
      zh: '维护类型为必填项',
      en: 'Maintenance type is required',
    },
    descriptionRequired: {
      zh: '描述为必填项',
      en: 'Description is required',
    },
    dateRequired: {
      zh: '日期为必填项',
      en: 'Date is required',
    },
    costInvalid: {
      zh: '费用必须为非负数',
      en: 'Cost must be non-negative',
    },
  },

  // Import/Export validation
  importExport: {
    fileRequired: {
      zh: '请选择文件',
      en: 'Please select a file',
    },
    invalidFileType: {
      zh: '文件类型无效',
      en: 'Invalid file type',
    },
    fileTooLarge: {
      zh: '文件太大',
      en: 'File is too large',
    },
    emptyFile: {
      zh: '文件为空',
      en: 'File is empty',
    },
    invalidData: {
      zh: '数据格式无效',
      en: 'Invalid data format',
    },
    missingRequiredColumns: {
      zh: '缺少必需的列',
      en: 'Missing required columns',
    },
  },

  // Authentication validation
  auth: {
    passwordRequired: {
      zh: '密码为必填项',
      en: 'Password is required',
    },
    passwordTooShort: {
      zh: '密码太短（至少8个字符）',
      en: 'Password is too short (minimum 8 characters)',
    },
    passwordInvalid: {
      zh: '密码错误',
      en: 'Invalid password',
    },
    sessionExpired: {
      zh: '会话已过期，请重新登录',
      en: 'Session expired, please login again',
    },
  },

  // Network and system errors
  system: {
    networkError: {
      zh: '网络连接失败',
      en: 'Network connection failed',
    },
    serverError: {
      zh: '服务器错误',
      en: 'Server error',
    },
    unknownError: {
      zh: '未知错误',
      en: 'Unknown error',
    },
    notFound: {
      zh: '未找到',
      en: 'Not found',
    },
    unauthorized: {
      zh: '未授权',
      en: 'Unauthorized',
    },
    forbidden: {
      zh: '禁止访问',
      en: 'Forbidden',
    },
  },
} as const;

/**
 * Get a validation error message in the specified language
 * @param key - The message key (can be nested with dots, e.g., 'quilt.nameRequired')
 * @param language - The language to use
 * @returns The translated error message
 */
export function getValidationMessage(key: string, language: Language): string {
  try {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = validationMessages;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        console.warn(`Validation message key not found: ${key}`);
        return key;
      }
    }

    if (current && typeof current === 'object' && language in current) {
      return current[language];
    }

    console.warn(`Language not found for validation message: ${key}`);
    return key;
  } catch (error) {
    console.error('Error getting validation message:', error);
    return key;
  }
}

/**
 * Get a validation error message with dynamic values
 * @param key - The message key
 * @param language - The language to use
 * @param values - Object with values to interpolate into the message
 * @returns The translated error message with interpolated values
 */
export function getValidationMessageWithValues(
  key: string,
  language: Language,
  values: Record<string, string | number>
): string {
  let message = getValidationMessage(key, language);

  // Replace placeholders like {fieldName} with actual values
  Object.entries(values).forEach(([placeholder, value]) => {
    message = message.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
  });

  return message;
}

/**
 * Create a custom validation message for min/max constraints
 */
export function getMinMaxMessage(
  type: 'min' | 'max',
  value: number,
  language: Language,
  unit?: string
): string {
  const unitStr = unit ? ` ${unit}` : '';

  if (type === 'min') {
    return language === 'zh'
      ? `最小值为 ${value}${unitStr}`
      : `Minimum value is ${value}${unitStr}`;
  } else {
    return language === 'zh'
      ? `最大值为 ${value}${unitStr}`
      : `Maximum value is ${value}${unitStr}`;
  }
}

/**
 * Create a custom validation message for length constraints
 */
export function getLengthMessage(type: 'min' | 'max', length: number, language: Language): string {
  if (type === 'min') {
    return language === 'zh'
      ? `最少需要 ${length} 个字符`
      : `Minimum ${length} characters required`;
  } else {
    return language === 'zh' ? `最多允许 ${length} 个字符` : `Maximum ${length} characters allowed`;
  }
}
