'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-provider';
import { api } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Wrench,
  Archive,
  CloudRain,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import type { Notification } from '@/types/notification';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const lang = t('language') === 'zh' ? 'zh' : 'en';

  // Fetch notifications from database
  const { data: notifications = [], isLoading, refetch } = api.notifications.getAll.useQuery({
    limit: 50,
    offset: 0,
  });

  // Mutations
  const markAsReadMutation = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = api.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather_change':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'maintenance_reminder':
        return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'disposal_suggestion':
        return <Archive className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            高
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="default" className="text-xs bg-yellow-500">
            中
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="secondary" className="text-xs">
            低
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: lang === 'zh' ? zhCN : enUS,
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div
        className="absolute right-0 top-16 w-96 max-h-[600px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">通知</h3>
            {!isLoading && notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notifications.filter((n) => !n.isRead).length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2"
                title="全部标记为已读"
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[500px]">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-300 animate-spin" />
              <p>加载中...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无通知</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          title="删除"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
