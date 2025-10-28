'use client';

import { useLanguage } from '@/lib/language-provider';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 transition-all duration-200 hover:bg-gray-100"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {language === 'zh' ? '中文' : 'EN'}
      </span>
    </Button>
  );
}