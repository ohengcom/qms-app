'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-provider';

interface UsagePeriod {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  usageType: string;
  location?: string | null;
  notes?: string | null;
}

interface UsageCalendarProps {
  usagePeriods: UsagePeriod[];
  quiltName: string;
  onDateSelect?: (date: Date) => void;
  onPeriodSelect?: (period: UsagePeriod) => void;
}

const USAGE_TYPE_COLORS = {
  REGULAR: 'bg-blue-500',
  GUEST: 'bg-green-500',
  SPECIAL_OCCASION: 'bg-purple-500',
  SEASONAL_ROTATION: 'bg-orange-500',
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function UsageCalendar({
  usagePeriods,
  quiltName,
  onDateSelect,
  onPeriodSelect,
}: UsageCalendarProps) {
  const { language } = useLanguage();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Create a map of dates to usage periods for quick lookup
  const usageMap = useMemo(() => {
    const map = new Map<string, UsagePeriod[]>();

    usagePeriods.forEach(period => {
      const startDate = new Date(period.startDate);
      const endDate = period.endDate ? new Date(period.endDate) : new Date();

      // Add all dates in the period to the map
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0];
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(period);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [usagePeriods]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    onDateSelect?.(clickedDate);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-border" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toISOString().split('T')[0];
      const periodsOnDate = usageMap.get(dateKey) || [];
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <button
          type="button"
          key={day}
          className={cn(
            'h-12 border border-border p-1 cursor-pointer hover:bg-muted relative text-left',
            isToday && 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
            isSelected && 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
          )}
          onClick={() => handleDateClick(day)}
          aria-label={`${MONTHS[currentMonth]} ${day}, ${currentYear}${periodsOnDate.length > 0 ? `, ${periodsOnDate.length} usage period${periodsOnDate.length > 1 ? 's' : ''}` : ''}`}
          aria-pressed={isSelected}
        >
          <div className="text-sm font-medium">{day}</div>
          {periodsOnDate.length > 0 && (
            <div className="absolute bottom-1 left-1 right-1 flex space-x-0.5" aria-hidden="true">
              {periodsOnDate.slice(0, 3).map((period, index) => (
                <div
                  key={`${period.id}-${index}`}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    USAGE_TYPE_COLORS[period.usageType as keyof typeof USAGE_TYPE_COLORS] ||
                      'bg-gray-400'
                  )}
                  title={`${period.usageType} - ${period.location || 'No location'}`}
                />
              ))}
              {periodsOnDate.length > 3 && (
                <div className="text-xs text-muted-foreground">+{periodsOnDate.length - 3}</div>
              )}
            </div>
          )}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
        {/* Day headers */}
        {DAYS.map(day => (
          <div
            key={day}
            className="h-8 bg-muted border-b border-border flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {days}
      </div>
    );
  };

  const renderYearView = () => {
    const months = [];

    for (let month = 0; month < 12; month++) {
      const monthUsage = usagePeriods.filter(period => {
        const startMonth = new Date(period.startDate).getMonth();
        const startYear = new Date(period.startDate).getFullYear();
        const endMonth = period.endDate ? new Date(period.endDate).getMonth() : startMonth;
        const endYear = period.endDate ? new Date(period.endDate).getFullYear() : startYear;

        return (
          (startYear === currentYear && startMonth <= month && month <= endMonth) ||
          (startYear < currentYear && endYear >= currentYear) ||
          (startYear === currentYear && startMonth <= month) ||
          (endYear === currentYear && month <= endMonth)
        );
      });

      months.push(
        <button
          type="button"
          key={month}
          className={cn(
            'p-4 border border-border rounded-lg cursor-pointer hover:bg-muted text-center',
            month === new Date().getMonth() &&
              currentYear === new Date().getFullYear() &&
              'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
          )}
          onClick={() => {
            setCurrentDate(new Date(currentYear, month, 1));
            setViewMode('month');
          }}
          aria-label={`${MONTHS[month]} ${currentYear}, ${monthUsage.length} usage period${monthUsage.length !== 1 ? 's' : ''}`}
        >
          <div className="font-medium text-sm">{MONTHS[month]}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {monthUsage.length} period{monthUsage.length !== 1 ? 's' : ''}
          </div>
          {monthUsage.length > 0 && (
            <div className="flex justify-center space-x-1 mt-2" aria-hidden="true">
              {Array.from(new Set(monthUsage.map(p => p.usageType)))
                .slice(0, 3)
                .map(type => (
                  <div
                    key={type}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      USAGE_TYPE_COLORS[type as keyof typeof USAGE_TYPE_COLORS] || 'bg-gray-400'
                    )}
                  />
                ))}
            </div>
          )}
        </button>
      );
    }

    return <div className="grid grid-cols-3 md:grid-cols-4 gap-4">{months}</div>;
  };

  const selectedDatePeriods = selectedDate
    ? usageMap.get(selectedDate.toISOString().split('T')[0]) || []
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Usage Calendar</span>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={viewMode}
              onValueChange={(value: 'month' | 'year') => setViewMode(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription>Visual timeline of usage periods for {quiltName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (viewMode === 'month' ? navigateMonth('prev') : navigateYear('prev'))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {viewMode === 'month' ? `${MONTHS[currentMonth]} ${currentYear}` : currentYear}
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (viewMode === 'month' ? navigateMonth('next') : navigateYear('next'))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar */}
        {viewMode === 'month' ? renderMonthView() : renderYearView()}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">Usage Types:</span>
          {Object.entries(USAGE_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={cn('w-3 h-3 rounded-full', color)} />
              <span className="text-xs text-muted-foreground">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Selected Date Details */}
        {selectedDate && selectedDatePeriods.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">
              {selectedDate.toLocaleDateString(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <div className="space-y-2">
              {selectedDatePeriods.map((period, index) => (
                <button
                  type="button"
                  key={`${period.id}-${index}`}
                  className="flex items-center justify-between p-2 bg-background rounded border border-border cursor-pointer hover:bg-muted w-full text-left"
                  onClick={() => onPeriodSelect?.(period)}
                  aria-label={`${period.usageType.replace('_', ' ')} usage period${period.location ? ` at ${period.location}` : ''}, ${period.endDate ? 'completed' : 'ongoing'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        USAGE_TYPE_COLORS[period.usageType as keyof typeof USAGE_TYPE_COLORS] ||
                          'bg-gray-400'
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {period.usageType.replace('_', ' ')}
                      </div>
                      {period.location && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
                          {period.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {period.endDate ? 'Completed' : 'Ongoing'}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
