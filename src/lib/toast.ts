import { toast as sonnerToast, ExternalToast } from 'sonner';
import { useNotificationStore } from './notification-store';

// Enhanced toast configuration
const defaultToastConfig: ExternalToast = {
  duration: 3000,
  closeButton: true,
  className: 'toast-custom',
  style: {
    borderRadius: '0.75rem',
    padding: '1rem',
    fontSize: '0.875rem',
  },
};

// Toast utility with bilingual support and notification history
export const toast = {
  success: (message: string, description?: string, config?: ExternalToast) => {
    sonnerToast.success(message, {
      ...defaultToastConfig,
      description,
      duration: 3000,
      ...config,
    });

    // Add to notification history
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: message,
      message: description || message,
      description,
    });
  },

  error: (message: string, description?: string, config?: ExternalToast) => {
    sonnerToast.error(message, {
      ...defaultToastConfig,
      description,
      duration: 5000, // Longer duration for errors
      ...config,
    });

    // Add to notification history
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: message,
      message: description || message,
      description,
    });
  },

  info: (message: string, description?: string, config?: ExternalToast) => {
    sonnerToast.info(message, {
      ...defaultToastConfig,
      description,
      duration: 3000,
      ...config,
    });

    // Add to notification history
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: message,
      message: description || message,
      description,
    });
  },

  warning: (message: string, description?: string, config?: ExternalToast) => {
    sonnerToast.warning(message, {
      ...defaultToastConfig,
      description,
      duration: 4000,
      ...config,
    });

    // Add to notification history
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title: message,
      message: description || message,
      description,
    });
  },

  loading: (message: string, config?: ExternalToast) => {
    return sonnerToast.loading(message, {
      ...defaultToastConfig,
      ...config,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    config?: ExternalToast
  ) => {
    return sonnerToast.promise(promise, {
      ...messages,
      ...defaultToastConfig,
      ...config,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Custom toast with full control
  custom: (message: string, config?: ExternalToast) => {
    return sonnerToast(message, {
      ...defaultToastConfig,
      ...config,
    });
  },
};

// Bilingual toast messages
export const toastMessages = {
  zh: {
    // Success messages
    createSuccess: '创建成功',
    updateSuccess: '更新成功',
    deleteSuccess: '删除成功',
    saveSuccess: '保存成功',
    importSuccess: '导入成功',
    exportSuccess: '导出成功',

    // Error messages
    createError: '创建失败',
    updateError: '更新失败',
    deleteError: '删除失败',
    saveError: '保存失败',
    importError: '导入失败',
    exportError: '导出失败',
    networkError: '网络错误',
    unknownError: '未知错误',

    // Loading messages
    creating: '正在创建...',
    updating: '正在更新...',
    deleting: '正在删除...',
    saving: '正在保存...',
    loading: '加载中...',
    importing: '正在导入...',
    exporting: '正在导出...',

    // Info messages
    noChanges: '没有更改',
    selectItems: '请选择项目',
    confirmDelete: '确认删除',
  },
  en: {
    // Success messages
    createSuccess: 'Created successfully',
    updateSuccess: 'Updated successfully',
    deleteSuccess: 'Deleted successfully',
    saveSuccess: 'Saved successfully',
    importSuccess: 'Imported successfully',
    exportSuccess: 'Exported successfully',

    // Error messages
    createError: 'Failed to create',
    updateError: 'Failed to update',
    deleteError: 'Failed to delete',
    saveError: 'Failed to save',
    importError: 'Failed to import',
    exportError: 'Failed to export',
    networkError: 'Network error',
    unknownError: 'Unknown error',

    // Loading messages
    creating: 'Creating...',
    updating: 'Updating...',
    deleting: 'Deleting...',
    saving: 'Saving...',
    loading: 'Loading...',
    importing: 'Importing...',
    exporting: 'Exporting...',

    // Info messages
    noChanges: 'No changes',
    selectItems: 'Please select items',
    confirmDelete: 'Confirm delete',
  },
};

// Helper to get message by language
export const getToastMessage = (key: keyof typeof toastMessages.zh, lang: 'zh' | 'en' = 'zh') => {
  return toastMessages[lang][key];
};
