/**
 * Notification Rule Engine
 * 
 * Checks various conditions and generates notifications based on:
 * - Weather changes (temperature change > 5°C)
 * - Maintenance reminders (continuous use > 30 days)
 * - Disposal suggestions (not used for 365 days)
 */

import { notificationRepository } from './repositories/notification.repository';
import { usageRepository } from './repositories/usage.repository';
import { quiltRepository } from './repositories/quilt.repository';
import type { CreateNotificationInput } from '@/types/notification';
import { dbLogger } from './logger';

/**
 * Weather data interface
 */
interface WeatherData {
  currentTemp: number;
  previousTemp?: number;
  forecast?: {
    date: string;
    minTemp: number;
    maxTemp: number;
  }[];
}

/**
 * Check for weather changes and create notifications
 */
export async function checkWeatherChangeNotifications(weatherData: WeatherData): Promise<number> {
  try {
    dbLogger.info('Checking weather change notifications', { weatherData });

    // Check if temperature changed significantly (> 5°C)
    if (weatherData.previousTemp !== undefined) {
      const tempChange = Math.abs(weatherData.currentTemp - weatherData.previousTemp);
      
      if (tempChange > 5) {
        // Determine if it's getting warmer or colder
        const isWarmer = weatherData.currentTemp > weatherData.previousTemp;
        const direction = isWarmer ? '升高' : '降低';
        
        // Check if similar notification already exists (within 24 hours)
        const existing = await notificationRepository.findSimilar('weather_change', undefined, 24);
        
        if (!existing) {
          const notification: CreateNotificationInput = {
            type: 'weather_change',
            priority: 'high',
            title: `天气变化提醒：温度${direction}${tempChange.toFixed(1)}°C`,
            message: `温度从 ${weatherData.previousTemp.toFixed(1)}°C ${direction}到 ${weatherData.currentTemp.toFixed(1)}°C，建议检查当前使用的被子是否合适。`,
            actionUrl: '/quilts',
            metadata: {
              previousTemp: weatherData.previousTemp,
              currentTemp: weatherData.currentTemp,
              tempChange,
              isWarmer,
            },
          };
          
          await notificationRepository.create(notification);
          dbLogger.info('Created weather change notification', { tempChange, direction });
          return 1;
        }
      }
    }
    
    return 0;
  } catch (error) {
    dbLogger.error('Error checking weather change notifications', error as Error);
    return 0;
  }
}

/**
 * Check for maintenance reminders based on continuous usage
 */
export async function checkMaintenanceReminders(): Promise<number> {
  try {
    dbLogger.info('Checking maintenance reminders');
    
    // Get all active usage records
    const activeUsages = await usageRepository.getAllActive();
    let notificationCount = 0;
    
    for (const usage of activeUsages) {
      // Calculate days of continuous use
      const startDate = new Date(usage.startDate);
      const now = new Date();
      const daysInUse = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If used for more than 30 days, create maintenance reminder
      if (daysInUse > 30) {
        // Check if similar notification already exists (within 7 days)
        const existing = await notificationRepository.findSimilar(
          'maintenance_reminder',
          usage.quiltId,
          7 * 24 // 7 days in hours
        );
        
        if (!existing) {
          // Get quilt details
          const quilt = await quiltRepository.findById(usage.quiltId);
          
          if (quilt) {
            const notification: CreateNotificationInput = {
              type: 'maintenance_reminder',
              priority: 'medium',
              title: `维护提醒：${quilt.name}`,
              message: `被子"${quilt.name}"已连续使用 ${daysInUse} 天，建议进行清洗或晾晒维护。`,
              quiltId: usage.quiltId,
              actionUrl: `/quilts/${usage.quiltId}`,
              metadata: {
                daysInUse,
                startDate: usage.startDate,
                quiltName: quilt.name,
              },
            };
            
            await notificationRepository.create(notification);
            dbLogger.info('Created maintenance reminder', { quiltId: usage.quiltId, daysInUse });
            notificationCount++;
          }
        }
      }
    }
    
    return notificationCount;
  } catch (error) {
    dbLogger.error('Error checking maintenance reminders', error as Error);
    return 0;
  }
}

/**
 * Check for disposal suggestions based on long-term non-usage
 */
export async function checkDisposalSuggestions(): Promise<number> {
  try {
    dbLogger.info('Checking disposal suggestions');
    
    // Get all quilts
    const quilts = await quiltRepository.findAll({});
    let notificationCount = 0;
    
    for (const quilt of quilts) {
      // Get usage history for this quilt
      const usageHistory = await usageRepository.findByQuiltId(quilt.id);
      
      // Check if quilt has not been used in the past 365 days
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      // Find the most recent usage
      const recentUsages = usageHistory.filter(usage => {
        const endDate = usage.endDate ? new Date(usage.endDate) : new Date();
        return endDate > oneYearAgo;
      });
      
      // If no usage in the past year, suggest disposal
      if (recentUsages.length === 0 && usageHistory.length > 0) {
        // Check if similar notification already exists (within 30 days)
        const existing = await notificationRepository.findSimilar(
          'disposal_suggestion',
          quilt.id,
          30 * 24 // 30 days in hours
        );
        
        if (!existing) {
          // Find the last usage date
          const lastUsage = usageHistory.reduce((latest, current) => {
            const currentEnd = current.endDate ? new Date(current.endDate) : new Date(current.startDate);
            const latestEnd = latest.endDate ? new Date(latest.endDate) : new Date(latest.startDate);
            return currentEnd > latestEnd ? current : latest;
          });
          
          const lastUsageDate = lastUsage.endDate 
            ? new Date(lastUsage.endDate) 
            : new Date(lastUsage.startDate);
          
          const daysSinceLastUse = Math.floor(
            (now.getTime() - lastUsageDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          const notification: CreateNotificationInput = {
            type: 'disposal_suggestion',
            priority: 'low',
            title: `淘汰建议：${quilt.name}`,
            message: `被子"${quilt.name}"已经 ${daysSinceLastUse} 天未使用，建议考虑是否需要保留。`,
            quiltId: quilt.id,
            actionUrl: `/quilts/${quilt.id}`,
            metadata: {
              daysSinceLastUse,
              lastUsageDate: lastUsageDate.toISOString(),
              quiltName: quilt.name,
            },
          };
          
          await notificationRepository.create(notification);
          dbLogger.info('Created disposal suggestion', { quiltId: quilt.id, daysSinceLastUse });
          notificationCount++;
        }
      }
    }
    
    return notificationCount;
  } catch (error) {
    dbLogger.error('Error checking disposal suggestions', error as Error);
    return 0;
  }
}

/**
 * Run all notification checks
 * This should be called periodically (e.g., daily or when app starts)
 */
export async function runAllNotificationChecks(weatherData?: WeatherData): Promise<{
  weatherNotifications: number;
  maintenanceNotifications: number;
  disposalNotifications: number;
  total: number;
}> {
  try {
    dbLogger.info('Running all notification checks');
    
    const results = {
      weatherNotifications: 0,
      maintenanceNotifications: 0,
      disposalNotifications: 0,
      total: 0,
    };
    
    // Check weather changes if weather data is provided
    if (weatherData) {
      results.weatherNotifications = await checkWeatherChangeNotifications(weatherData);
    }
    
    // Check maintenance reminders
    results.maintenanceNotifications = await checkMaintenanceReminders();
    
    // Check disposal suggestions
    results.disposalNotifications = await checkDisposalSuggestions();
    
    results.total = 
      results.weatherNotifications + 
      results.maintenanceNotifications + 
      results.disposalNotifications;
    
    dbLogger.info('Notification checks completed', results);
    
    return results;
  } catch (error) {
    dbLogger.error('Error running notification checks', error as Error);
    throw error;
  }
}

/**
 * Clean up old read notifications (older than 30 days)
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<number> {
  try {
    dbLogger.info('Cleaning up old notifications', { daysOld });
    const deletedCount = await notificationRepository.deleteOldReadNotifications(daysOld);
    dbLogger.info('Old notifications cleaned up', { deletedCount });
    return deletedCount;
  } catch (error) {
    dbLogger.error('Error cleaning up old notifications', error as Error);
    return 0;
  }
}
