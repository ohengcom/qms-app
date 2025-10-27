# QMS Monitoring and Observability Guide

This guide covers the comprehensive monitoring setup for the QMS (Quilt Management System) application, including metrics collection, alerting, logging, and performance monitoring.

## Overview

The QMS monitoring stack includes:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation and analysis
- **Promtail**: Log collection agent
- **AlertManager**: Alert routing and notification
- **Custom exporters**: Application-specific metrics

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   QMS App       │───▶│   Prometheus    │───▶│    Grafana      │
│   /api/metrics  │    │   (Metrics)     │    │  (Dashboards)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Promtail     │───▶│      Loki       │───▶│   AlertManager  │
│  (Log Agent)    │    │   (Logs)        │    │   (Alerts)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Setup Monitoring Stack
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Setup monitoring
./scripts/setup-monitoring.sh

# Check status
./scripts/setup-monitoring.sh health
```

### 2. Access Dashboards
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

## Metrics Collection

### Application Metrics

The QMS application exposes metrics at `/api/metrics` in Prometheus format:

#### Business Metrics
- `qms_quilts_total`: Total number of quilts
- `qms_quilts_in_use`: Number of quilts currently in use
- `qms_users_total`: Total number of users
- `qms_activity_24h`: Activity in the last 24 hours

#### Performance Metrics
- `qms_db_response_time_ms`: Database response time
- `qms_memory_usage_bytes`: Memory usage by type
- `qms_uptime_seconds`: Application uptime

#### System Metrics
- `qms_nodejs_version`: Node.js version information
- `qms_build_info`: Build and environment information

### Infrastructure Metrics

#### Database (PostgreSQL)
- Connection count and usage
- Query performance and slow queries
- Database size and growth
- Replication lag (if applicable)

#### Cache (Redis)
- Memory usage and hit rates
- Connection count
- Command statistics
- Persistence status

#### System Resources
- CPU usage and load average
- Memory usage and swap
- Disk usage and I/O
- Network traffic

## Dashboards

### QMS Application Overview
- Application health and availability
- Request rate and response times
- Error rates and status codes
- Business metrics (quilts, users, activity)

### System Performance
- Resource utilization (CPU, memory, disk)
- Database performance
- Cache performance
- Network metrics

### Error Tracking
- Application errors and exceptions
- HTTP error rates
- Database connection errors
- System-level errors

## Alerting

### Alert Rules

#### Critical Alerts
- **Application Down**: Application is not responding
- **Database Down**: Database is not accessible
- **High Error Rate**: Error rate > 5% for 5 minutes
- **Disk Space Low**: < 10% disk space remaining

#### Warning Alerts
- **High Response Time**: 95th percentile > 2 seconds
- **High Memory Usage**: > 90% memory usage
- **High CPU Usage**: > 80% CPU usage for 5 minutes
- **Backup Failure**: Backup older than 25 hours

### Alert Channels

#### Email Notifications
Configure SMTP settings in environment variables:
```bash
ALERT_EMAIL="admin@example.com"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="alerts@example.com"
SMTP_PASSWORD="password"
```

#### Slack Integration
Set up Slack webhook for team notifications:
```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/..."
```

#### Custom Webhooks
Configure custom webhook endpoints:
```bash
WEBHOOK_URL="https://your-webhook-endpoint.com/alerts"
```

## Log Management

### Log Sources
- **Application Logs**: Structured JSON logs from QMS app
- **Access Logs**: Nginx access logs with request details
- **Error Logs**: Nginx error logs and application errors
- **System Logs**: System-level logs and events

### Log Aggregation
Loki collects logs from multiple sources:
- Docker container logs
- File-based logs
- Syslog messages
- Custom application logs

### Log Queries
Common Loki queries for troubleshooting:

```logql
# Application errors
{job="qms-app"} |= "ERROR"

# HTTP 5xx errors
{job="nginx-access"} | json | status >= 500

# Database connection errors
{job="qms-app"} |= "database" |= "error"

# User authentication events
{job="qms-app"} |= "auth" | json | level="info"
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

#### Application Performance
- **Response Time**: 95th percentile < 2 seconds
- **Throughput**: Requests per second
- **Error Rate**: < 1% error rate
- **Availability**: > 99.9% uptime

#### Database Performance
- **Query Time**: Average query time < 100ms
- **Connection Usage**: < 80% of max connections
- **Cache Hit Rate**: > 95% for frequently accessed data

#### System Performance
- **CPU Usage**: < 70% average usage
- **Memory Usage**: < 80% usage
- **Disk I/O**: Response time < 10ms
- **Network**: No packet loss

### Performance Optimization

#### Application Level
- Monitor slow API endpoints
- Optimize database queries
- Implement caching strategies
- Use connection pooling

#### Database Level
- Monitor query performance
- Optimize indexes
- Analyze query plans
- Monitor connection usage

#### System Level
- Monitor resource usage
- Optimize container resources
- Implement load balancing
- Use CDN for static assets

## Backup Monitoring

### Automated Backup Checks
```bash
# Monitor backup health
./scripts/monitor-backups.sh

# Check backup status
./scripts/monitor-backups.sh status
```

### Backup Metrics
- Backup age and frequency
- Backup size and integrity
- Backup success/failure rates
- Storage usage and retention

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats qms-app

# Check application metrics
curl http://localhost:3000/api/metrics | grep memory

# Restart application if needed
docker-compose -f docker-compose.prod.yml restart qms-app
```

#### Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check connection count
docker-compose -f docker-compose.prod.yml exec postgres psql -U qms_user -d qms_production -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker-compose -f docker-compose.prod.yml exec postgres psql -U qms_user -d qms_production -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### High Error Rates
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs qms-app | grep ERROR

# Check Nginx error logs
docker-compose -f docker-compose.prod.yml logs nginx | grep error

# Check system resources
docker stats
```

### Monitoring Service Issues

#### Prometheus Not Collecting Metrics
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check application metrics endpoint
curl http://localhost:3000/api/metrics

# Restart Prometheus
docker-compose -f docker-compose.monitoring.yml restart prometheus
```

#### Grafana Dashboard Issues
```bash
# Check Grafana logs
docker-compose -f docker-compose.monitoring.yml logs grafana

# Reset Grafana admin password
docker-compose -f docker-compose.monitoring.yml exec grafana grafana-cli admin reset-admin-password newpassword

# Restart Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana
```

## Maintenance

### Daily Tasks
- [ ] Check dashboard for any alerts
- [ ] Verify backup completion
- [ ] Monitor error rates and performance
- [ ] Check disk space usage

### Weekly Tasks
- [ ] Review performance trends
- [ ] Update alert thresholds if needed
- [ ] Clean up old logs and metrics
- [ ] Test alert notifications

### Monthly Tasks
- [ ] Review and optimize dashboards
- [ ] Update monitoring configuration
- [ ] Analyze performance trends
- [ ] Plan capacity upgrades if needed

## Security Considerations

### Access Control
- Secure Grafana with strong passwords
- Use HTTPS for all monitoring endpoints
- Implement network segmentation
- Regular security updates

### Data Privacy
- Avoid logging sensitive information
- Implement log retention policies
- Secure backup storage
- Monitor access to monitoring data

## Scaling Monitoring

### High Availability
- Deploy Prometheus in HA mode
- Use external storage for metrics
- Implement Grafana clustering
- Set up monitoring redundancy

### Performance Optimization
- Optimize metric collection intervals
- Implement metric filtering
- Use recording rules for complex queries
- Archive old metrics data

## Integration with CI/CD

### Automated Deployment Monitoring
The CI/CD pipeline includes monitoring checks:
- Health checks after deployment
- Performance regression detection
- Alert validation
- Rollback triggers based on metrics

### Monitoring as Code
- Version control monitoring configuration
- Automated dashboard deployment
- Infrastructure as code for monitoring
- Automated testing of alert rules

## Support and Resources

### Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)

### Community Resources
- Prometheus community forums
- Grafana community dashboards
- Docker monitoring best practices
- Node.js application monitoring guides

### Getting Help
1. Check the troubleshooting section
2. Review service logs
3. Consult community resources
4. Contact system administrators

---

For additional support or questions about the monitoring setup, please refer to the deployment documentation or contact the development team.