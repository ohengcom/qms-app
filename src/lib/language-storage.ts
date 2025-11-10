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
    // Error saving language - continue without saving
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
    // Error clearing language - continue
  }
}

/**
 * Get the default language
 * Always defaults to Chinese ('zh')
 */
export function getDefaultLanguage(): Language {
  return 'zh';
}

/**
 * Get the language to use, with the following priority:
 * 1. Stored language preference
 * 2. Default fallback (zh)
 */
export function getInitialLanguage(): Language {
  // First, try to get stored preference
  const stored = getStoredLanguage();
  if (stored) {
    return stored;
  }

  // Default to Chinese
  return getDefaultLanguage();
}
