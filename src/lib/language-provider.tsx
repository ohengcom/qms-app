'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageContextType, translations, getNestedTranslation } from './i18n';
import { getInitialLanguage, setStoredLanguage } from './language-storage';

// 语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言提供者组件
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with stored language or browser default
  const [language, setLanguage] = useState<Language>(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      return getInitialLanguage();
    }
    return 'zh'; // Server-side default
  });

  // Update document lang attribute on mount
  useEffect(() => {
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update document lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    }
  }, [language]);

  // Save language setting to localStorage and update document
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setStoredLanguage(lang);

    // Update document lang attribute immediately
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
  };

  // 翻译函数
  const t = (key: string): string => {
    const translation = getNestedTranslation(translations[language], key);

    if (!translation) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} in language: ${language}`);
      }
      return key;
    }

    return translation;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// 使用语言的钩子
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
