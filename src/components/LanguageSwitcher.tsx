'use client';

import { useLanguage } from '@/lib/language-provider';
import type { Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

const localeNames: Record<Language, { flag: string; name: string }> = {
  zh: { flag: '🇨🇳', name: '中文' },
  en: { flag: '🇺🇸', name: 'English' },
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const current = localeNames[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {current.flag} {current.name}
          </span>
          <span className="sm:hidden">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeNames).map(([key, { flag, name }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key as Language)}
            className="gap-2 cursor-pointer"
          >
            <span>{flag}</span>
            <span>{name}</span>
            {key === language && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
