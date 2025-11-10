/**
 * Test API: Create a test notification
 * Access: GET /api/test/create-notification
 */

import { NextResponse } from 'next/server';
import { notificationRepository } from '@/lib/repositories/notification.repository';

export async function GET() {
  try {
    const notification = await notificationRepository.create({
      type: 'maintenance_reminder',
      priority: 'high',
      title: '🎉 通知系统测试',
      message: '恭喜！通知系统已成功部署并运行。这是一条测试通知。',
      actionUrl: '/quilts',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification created successfully',
      notification: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Failed to create test notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
