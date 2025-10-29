import { toast as sonnerToast } from 'sonner';

// Toast utility with bilingual support
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 3000,
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 4000,
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 3500,
    });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
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
