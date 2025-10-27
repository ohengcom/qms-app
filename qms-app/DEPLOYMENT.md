# QMS Production Deployment Guide

This guide covers the complete production deployment process for the QMS (Quilt Management System) application.

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum, SSD recommended
- **Network**: Static IP address, domain name configured

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (for SSL certificates)
- Curl (for health checks)

## Initial Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd qms-app
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.production .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**
```bash
# Database
POSTGRES_PASSWORD="your_secure_database_password"
POSTGRES_USER="qms_user"
POSTGRES_DB="qms_production"

# Redis
REDIS_PASSWORD="your_secure_redis_password"

# Authentication
NEXTAUTH_SECRET="your_32_character_secret_key"
NEXTAUTH_URL="https://your-domain.com"

# Email (optional)
SMTP_HOST="your-smtp-server"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
```

### 3. SSL Certificates

#### Option A: Self-Signed (Development/Testing)
```bash
chmod +x scripts/generate-ssl.sh
./scripts/generate-ssl.sh your-domain.com
```

#### Option B: Let's Encrypt (Production)
```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

### 4. Make Scripts Executable
```bash
chmod +x scripts/*.sh
```

## Deployment Process

### 1. Initial Deployment
```bash
# Run deployment script
./scripts/deploy.sh
```

The deployment script will:
- Check prerequisites
- Create a backup (if existing data)
- Build Docker images
- Start services
- Run database migrations
- Perform health checks

### 2. Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl -f https://your-domain.com/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f qms-app
```

## Service Management

### Starting Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stopping Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Restarting Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Viewing Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f qms-app
```

## Database Management

### Creating Backups
```bash
# Manual backup
docker-compose -f docker-compose.prod.yml run --rm postgres-backup

# Automated backups (cron job)
# Add to crontab: 0 2 * * * /path/to/qms-app/scripts/backup.sh
```

### Restoring from Backup
```bash
# List available backups
ls -la backups/

# Restore from backup
./scripts/restore.sh qms_backup_20231201_020000.sql.gz
```

### Database Schema Management
```bash
# Initialize database schema (first deployment only)
npm run db:setup

# Test database connection
npm run db:test

# Schema changes are handled directly through SQL or Neon console
# No migration files needed with Neon Serverless Driver
```

## Monitoring Setup (Optional)

### 1. Start Monitoring Stack
```bash
# Set Grafana password
export GRAFANA_PASSWORD="your_grafana_password"

# Start monitoring services
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
```

### 2. Access Monitoring Dashboards
- **Grafana**: http://your-domain.com:3001 (admin/your_grafana_password)
- **Prometheus**: http://your-domain.com:9090

### 3. Configure Alerts
Edit `monitoring/alert_rules.yml` to customize alert thresholds and add notification channels in Grafana.

## Security Considerations

### 1. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. SSL/TLS Configuration
- Use strong SSL ciphers (configured in nginx.conf)
- Enable HSTS headers
- Regular certificate renewal for Let's Encrypt

### 3. Database Security
- Use strong passwords
- Limit database connections
- Regular security updates

### 4. Application Security
- Keep dependencies updated
- Regular security scans
- Monitor access logs

## Performance Optimization

### 1. Database Optimization
```bash
# Analyze database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U qms_user -d qms_production -c "SELECT * FROM pg_stat_activity;"

# Optimize queries
docker-compose -f docker-compose.prod.yml exec postgres psql -U qms_user -d qms_production -c "EXPLAIN ANALYZE SELECT * FROM quilts;"
```

### 2. Application Optimization
- Monitor memory usage
- Optimize image sizes
- Use CDN for static assets
- Enable gzip compression (configured in nginx)

### 3. Caching
- Redis for session storage
- Nginx for static file caching
- Application-level caching

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs qms-app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec qms-app env

# Verify database connection
curl http://localhost:3000/api/db-test
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Test database connection
curl http://localhost:3000/api/db-test

# Check database status via Neon console
# Visit your Neon dashboard to monitor database health
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443
```

#### 4. Performance Issues
```bash
# Check resource usage
docker stats

# Check application metrics
curl https://your-domain.com/api/health

# Monitor database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U qms_user -d qms_production -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Maintenance

### Regular Tasks

#### Daily
- Check application health
- Monitor disk space
- Review error logs

#### Weekly
- Update system packages
- Review security logs
- Check backup integrity

#### Monthly
- Update Docker images
- Review performance metrics
- Security audit

### Update Process
```bash
# 1. Create backup
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Update images
docker-compose -f docker-compose.prod.yml pull

# 4. Deploy updates
./scripts/deploy.sh

# 5. Verify deployment
curl -f https://your-domain.com/api/health
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis clustering
- CDN integration

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Tune application settings

## Support and Documentation

### Log Locations
- Application logs: `docker-compose logs qms-app`
- Nginx logs: `./logs/nginx/`
- Database logs: `docker-compose logs postgres`

### Configuration Files
- Application: `.env.local`
- Nginx: `nginx/conf.d/qms.conf`
- Database: `docker-compose.prod.yml`

### Useful Commands
```bash
# View running containers
docker ps

# Execute commands in container
docker-compose -f docker-compose.prod.yml exec qms-app bash

# View container resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

## Emergency Procedures

### Application Rollback
```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Restore from backup
./scripts/restore.sh latest_backup.sql.gz

# Start previous version
docker-compose -f docker-compose.prod.yml up -d
```

### Database Recovery
```bash
# Stop application
docker-compose -f docker-compose.prod.yml stop qms-app

# Restore database
./scripts/restore.sh backup_file.sql.gz

# Start application
docker-compose -f docker-compose.prod.yml start qms-app
```

For additional support, check the application logs and monitoring dashboards for detailed error information.