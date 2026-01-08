'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Package,
  BarChart3,
  Settings,
  Calendar,
  Upload,
  Search,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface Quilt {
  id: number;
  name: string;
  color: string;
  location: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [quilts, setQuilts] = React.useState<Quilt[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const { setTheme } = useTheme();

  // 监听 Ctrl+K 快捷键
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // 搜索被子
  React.useEffect(() => {
    if (!open) return;

    const searchQuilts = async () => {
      if (search.length < 1) {
        setQuilts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/quilts?search=${encodeURIComponent(search)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setQuilts(data.quilts || []);
        }
      } catch (error) {
        console.error('Failed to search quilts:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchQuilts, 300);
    return () => clearTimeout(debounce);
  }, [search, open]);

  // 导航项
  const navigationItems = [
    { name: t('navigation.dashboard'), href: '/', icon: Home },
    { name: t('navigation.quilts'), href: '/quilts', icon: Package },
    { name: t('navigation.usage'), href: '/usage', icon: Calendar },
    { name: t('navigation.analytics'), href: '/analytics', icon: BarChart3 },
    { name: t('navigation.reports'), href: '/reports', icon: Upload },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
  ];

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="命令面板"
      description="搜索被子或快速导航"
    >
      <CommandInput
        placeholder={t('quilts.actions.search') + '... (Ctrl+K)'}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{loading ? '搜索中...' : '没有找到结果'}</CommandEmpty>

        {/* 被子搜索结果 */}
        {quilts.length > 0 && (
          <CommandGroup heading="被子">
            {quilts.map(quilt => (
              <CommandItem
                key={quilt.id}
                value={`quilt-${quilt.id}-${quilt.name}`}
                onSelect={() => runCommand(() => router.push(`/quilts/${quilt.id}`))}
              >
                <Package className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{quilt.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {quilt.color} · {quilt.location}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 页面导航 */}
        <CommandGroup heading="页面导航">
          {navigationItems.map(item => (
            <CommandItem
              key={item.href}
              value={`nav-${item.name}`}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* 主题切换 */}
        <CommandGroup heading="主题">
          <CommandItem value="theme-light" onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>浅色模式</span>
          </CommandItem>
          <CommandItem value="theme-dark" onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>深色模式</span>
          </CommandItem>
          <CommandItem value="theme-system" onSelect={() => runCommand(() => setTheme('system'))}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>跟随系统</span>
          </CommandItem>
        </CommandGroup>

        {/* 快速搜索 */}
        <CommandGroup heading="快速操作">
          <CommandItem
            value="search-quilts"
            onSelect={() => runCommand(() => router.push('/quilts'))}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>搜索所有被子</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
