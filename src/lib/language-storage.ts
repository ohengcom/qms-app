/**
 * Language Storage Utility
 * Handles localStorage operations for language preference persistence
 */

import type { Language } from './i18n';

const LANGUAGE_STORAGE_KEY = 'qms-language-preference';

/**
 * Get the stored language preference from localStorage
 * @returns The stored language or null if not found
 */
export function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'zh' || stored === 'en')) {
      return stored as Language;
    }
    return null;
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
    return null;
  }
}

/**
 * Save the language preference to localStorage
 * @param language - The language to store
 */
export function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language to localStorage:', error);
  }
}

/**
 * Clear the stored language preference
 */
export function clearStoredLanguage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing language from localStorage:', error);
  }
}

/**
 * Get the default language based on browser settings
 * Falls back to 'zh' if detection fails
 */
export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'zh';
  }

  try {
    // Check browser language
    const browserLang = navigator.language.toLowerCase();

    // If browser language starts with 'zh', use Chinese
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }

    // If browser language starts with 'en', use English
    if (browserLang.startsWith('en')) {
      return 'en';
    }

    // Default to Chinese for other languages
    return 'zh';
  } catch (error) {
    console.error('Error detecting browser language:', error);
    return 'zh';
  }
}

/**
 * Get the language to use, with the following priority:
 * 1. Stored language preference
 * 2. Browser language
 * 3. Default fallback (zh)
 */
export function getInitialLanguage(): Language {
  // First, try to get stored preference
  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }

  // Fall back to browser language detection
  return getDefaultLanguage();
}
