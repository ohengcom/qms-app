/**
 * Security monitoring and logging system
 * Tracks security events, suspicious activities, and potential threats
 */

import { NextRequest } from 'next/server';

export interface SecurityEvent {
  type:
    | 'rate_limit_exceeded'
    | 'invalid_input'
    | 'suspicious_request'
    | 'authentication_failure'
    | 'xss_attempt'
    | 'sql_injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ip: string;
  userAgent: string;
  path: string;
  details: Record<string, unknown>;
  blocked: boolean;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Add to in-memory store
    this.events.push(securityEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, {
        ip: event.ip,
        path: event.path,
        details: event.details,
      });
    }

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(securityEvent);
    }

    // Send alerts for critical events
    if (event.severity === 'critical') {
      this.sendAlert(securityEvent);
    }
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEvent['type'], limit = 50): SecurityEvent[] {
    return this.events.filter(event => event.type === type).slice(-limit);
  }

  /**
   * Get events by IP address
   */
  getEventsByIP(ip: string, limit = 50): SecurityEvent[] {
    return this.events.filter(event => event.ip === ip).slice(-limit);
  }

  /**
   * Check if IP is suspicious based on recent activity
   */
  isSuspiciousIP(ip: string): boolean {
    const recentEvents = this.getEventsByIP(ip, 20);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Count events in the last hour
    const recentCount = recentEvents.filter(
      event => new Date(event.timestamp).getTime() > oneHourAgo
    ).length;

    // Consider suspicious if more than 10 security events in the last hour
    return recentCount > 10;
  }

  /**
   * Generate security report
   */
  generateReport(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topSuspiciousIPs: Array<{ ip: string; count: number }>;
    recentCriticalEvents: SecurityEvent[];
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    this.events.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      // Count by IP
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
    });

    // Get top suspicious IPs
    const topSuspiciousIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get recent critical events
    const recentCriticalEvents = this.events
      .filter(event => event.severity === 'critical')
      .slice(-10);

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      topSuspiciousIPs,
      recentCriticalEvents,
    };
  }

  /**
   * Send event to external monitoring service
   */
  private async sendToMonitoringService(event: SecurityEvent): Promise<void> {
    try {
      // Example: Send to webhook or monitoring service
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: 'QMS',
            event,
            environment: process.env.NODE_ENV,
          }),
        });
      }
    } catch (error) {
      // Failed to send security event - fail silently
    }
  }

  /**
   * Send alert for critical events
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    try {
      // Example: Send to Slack, email, or alerting service
      if (process.env.ALERT_WEBHOOK_URL) {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `🚨 CRITICAL Security Event in QMS`,
            attachments: [
              {
                color: 'danger',
                fields: [
                  { title: 'Type', value: event.type, short: true },
                  { title: 'IP', value: event.ip, short: true },
                  { title: 'Path', value: event.path, short: true },
                  { title: 'Blocked', value: event.blocked ? 'Yes' : 'No', short: true },
                  { title: 'Details', value: JSON.stringify(event.details), short: false },
                ],
                timestamp: event.timestamp,
              },
            ],
          }),
        });
      }
    } catch (error) {
      // Failed to send security alert - fail silently
    }
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();

/**
 * Helper functions for common security checks
 */

/**
 * Extract client information from request
 */
export function getClientInfo(request: NextRequest): {
  ip: string;
  userAgent: string;
  path: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;

  return { ip, userAgent, path };
}

/**
 * Check for XSS attempts in input
 */
export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /('|(\\')|(;)|(--)|(\s)|(\/\*))/gi,
    /(\b(WAITFOR|DELAY)\b)/gi,
    /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR)\b)/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for suspicious request patterns
 */
export function detectSuspiciousRequest(request: NextRequest): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const { userAgent, path } = getClientInfo(request);

  // Check for bot-like user agents
  const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Bot-like user agent');
  }

  // Check for suspicious paths
  const suspiciousPaths = [
    /\/admin/i,
    /\/wp-admin/i,
    /\/phpmyadmin/i,
    /\/config/i,
    /\/\.env/i,
    /\/\.git/i,
    /\/backup/i,
    /\/sql/i,
  ];

  if (suspiciousPaths.some(pattern => pattern.test(path))) {
    reasons.push('Suspicious path access');
  }

  // Check for unusual request headers
  const referer = request.headers.get('referer');
  if (referer && !referer.includes(request.nextUrl.hostname)) {
    reasons.push('External referer');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Middleware to monitor requests for security threats
 */
export function monitorRequest(request: NextRequest): void {
  const clientInfo = getClientInfo(request);

  // Check if IP is already flagged as suspicious
  if (securityMonitor.isSuspiciousIP(clientInfo.ip)) {
    securityMonitor.logEvent({
      type: 'suspicious_request',
      severity: 'medium',
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      path: clientInfo.path,
      details: { reason: 'Previously flagged IP' },
      blocked: false,
    });
  }

  // Check for suspicious request patterns
  const suspiciousCheck = detectSuspiciousRequest(request);
  if (suspiciousCheck.suspicious) {
    securityMonitor.logEvent({
      type: 'suspicious_request',
      severity: 'low',
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      path: clientInfo.path,
      details: { reasons: suspiciousCheck.reasons },
      blocked: false,
    });
  }
}
