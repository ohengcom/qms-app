import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

export type RealtimeEvent = 
  | { type: 'quilt_created'; data: { quiltId: number } }
  | { type: 'quilt_updated'; data: { quiltId: number } }
  | { type: 'quilt_deleted'; data: { quiltId: number } }
  | { type: 'usage_started'; data: { quiltId: number; usageId: number } }
  | { type: 'usage_ended'; data: { quiltId: number; usageId: number } }
  | { type: 'dashboard_updated'; data: { timestamp: Date } };

class RealtimeService extends EventEmitter {
  private static instance: RealtimeService;
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    super();
    this.db = db;
  }

  static getInstance(db: PrismaClient): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService(db);
    }
    return RealtimeService.instance;
  }

  // Emit events for real-time updates
  emitQuiltCreated(quiltId: number) {
    this.emit('realtime_event', {
      type: 'quilt_created',
      data: { quiltId }
    } as RealtimeEvent);
    
    // Also emit dashboard update
    this.emitDashboardUpdate();
  }

  emitQuiltUpdated(quiltId: number) {
    this.emit('realtime_event', {
      type: 'quilt_updated',
      data: { quiltId }
    } as RealtimeEvent);
    
    this.emitDashboardUpdate();
  }

  emitQuiltDeleted(quiltId: number) {
    this.emit('realtime_event', {
      type: 'quilt_deleted',
      data: { quiltId }
    } as RealtimeEvent);
    
    this.emitDashboardUpdate();
  }

  emitUsageStarted(quiltId: number, usageId: number) {
    this.emit('realtime_event', {
      type: 'usage_started',
      data: { quiltId, usageId }
    } as RealtimeEvent);
    
    this.emitDashboardUpdate();
  }

  emitUsageEnded(quiltId: number, usageId: number) {
    this.emit('realtime_event', {
      type: 'usage_ended',
      data: { quiltId, usageId }
    } as RealtimeEvent);
    
    this.emitDashboardUpdate();
  }

  emitDashboardUpdate() {
    this.emit('realtime_event', {
      type: 'dashboard_updated',
      data: { timestamp: new Date() }
    } as RealtimeEvent);
  }

  // Subscribe to events
  onRealtimeEvent(callback: (event: RealtimeEvent) => void) {
    this.on('realtime_event', callback);
    
    // Return unsubscribe function
    return () => {
      this.off('realtime_event', callback);
    };
  }

  // Get current connection count (for monitoring)
  getConnectionCount(): number {
    return this.listenerCount('realtime_event');
  }

  // Cleanup method
  cleanup() {
    this.removeAllListeners();
  }
}

export { RealtimeService };