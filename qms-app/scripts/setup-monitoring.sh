#!/bin/bash

# QMS Monitoring Setup Script
# This script sets up comprehensive monitoring for the QMS application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-"admin123"}
ALERT_EMAIL=${ALERT_EMAIL:-"admin@example.com"}
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if main application is running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "qms-app.*Up"; then
        warn "Main application is not running. Starting it first..."
        docker-compose -f docker-compose.prod.yml up -d
        sleep 30
    fi
    
    log "Prerequisites check passed"
}

# Create monitoring directories
setup_directories() {
    log "Setting up monitoring directories..."
    
    mkdir -p monitoring/grafana/provisioning/{dashboards,datasources}
    mkdir -p monitoring/grafana/dashboards
    mkdir -p logs/{grafana,prometheus,loki}
    
    # Set proper permissions
    chmod -R 755 monitoring/
    chmod -R 755 logs/
    
    log "Directories created successfully"
}

# Configure Grafana
configure_grafana() {
    log "Configuring Grafana..."
    
    # Set Grafana password
    export GRAFANA_PASSWORD="$GRAFANA_PASSWORD"
    
    # Create Grafana configuration
    cat > monitoring/grafana/grafana.ini << EOF
[server]
http_port = 3000
domain = localhost

[security]
admin_user = admin
admin_password = $GRAFANA_PASSWORD

[users]
allow_sign_up = false
allow_org_create = false

[auth.anonymous]
enabled = false

[alerting]
enabled = true

[smtp]
enabled = true
host = localhost:587
user = 
password = 
from_address = $ALERT_EMAIL
from_name = QMS Monitoring

[log]
mode = console file
level = info
EOF

    log "Grafana configuration completed"
}

# Setup Prometheus alerts
setup_alerts() {
    log "Setting up Prometheus alerts..."
    
    # Create alertmanager configuration
    cat > monitoring/alertmanager.yml << EOF
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: '$ALERT_EMAIL'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: '$ALERT_EMAIL'
        subject: 'QMS Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
EOF

    if [ -n "$SLACK_WEBHOOK" ]; then
        cat >> monitoring/alertmanager.yml << EOF
    slack_configs:
      - api_url: '$SLACK_WEBHOOK'
        channel: '#alerts'
        title: 'QMS Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
EOF
    fi

    log "Alert configuration completed"
}

# Start monitoring services
start_monitoring() {
    log "Starting monitoring services..."
    
    # Start monitoring stack
    docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 60
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    log "Checking service health..."
    
    local services=("prometheus:9090" "grafana:3001" "loki:3100")
    local failed_services=()
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        info "Checking $name..."
        
        if curl -f "http://localhost:$port" >/dev/null 2>&1; then
            log "✅ $name is healthy"
        else
            error "❌ $name health check failed"
            failed_services+=("$name")
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        log "All monitoring services are healthy!"
    else
        error "Failed services: ${failed_services[*]}"
        return 1
    fi
}

# Import Grafana dashboards
import_dashboards() {
    log "Importing Grafana dashboards..."
    
    # Wait for Grafana to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://admin:$GRAFANA_PASSWORD@localhost:3001/api/health" >/dev/null 2>&1; then
            break
        fi
        
        info "Waiting for Grafana to be ready (attempt $attempt/$max_attempts)..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        error "Grafana failed to start within expected time"
        return 1
    fi
    
    # Import dashboards via API
    for dashboard_file in monitoring/grafana/dashboards/*.json; do
        if [ -f "$dashboard_file" ]; then
            local dashboard_name=$(basename "$dashboard_file" .json)
            info "Importing dashboard: $dashboard_name"
            
            curl -X POST \
                -H "Content-Type: application/json" \
                -u "admin:$GRAFANA_PASSWORD" \
                -d @"$dashboard_file" \
                "http://localhost:3001/api/dashboards/db" || warn "Failed to import $dashboard_name"
        fi
    done
    
    log "Dashboard import completed"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /tmp/qms-logrotate << EOF
/var/log/qms-app/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f docker-compose.prod.yml restart qms-app
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
    endscript
}
EOF

    # Install logrotate configuration (requires sudo)
    if command -v sudo >/dev/null 2>&1; then
        sudo mv /tmp/qms-logrotate /etc/logrotate.d/qms
        log "Log rotation configured"
    else
        warn "Cannot install logrotate configuration (sudo not available)"
        warn "Please manually install /tmp/qms-logrotate to /etc/logrotate.d/qms"
    fi
}

# Create monitoring summary
create_summary() {
    log "Creating monitoring summary..."
    
    cat > MONITORING_SUMMARY.md << EOF
# QMS Monitoring Setup Summary

## Services Started
- ✅ Prometheus (Metrics): http://localhost:9090
- ✅ Grafana (Dashboards): http://localhost:3001
- ✅ Loki (Logs): http://localhost:3100

## Access Information
- **Grafana Login**: admin / $GRAFANA_PASSWORD
- **Prometheus**: No authentication required
- **Loki**: No authentication required

## Key Dashboards
- QMS Application Overview
- System Metrics
- Database Performance
- Error Tracking

## Alert Configuration
- Email alerts: $ALERT_EMAIL
- Slack alerts: $([ -n "$SLACK_WEBHOOK" ] && echo "Configured" || echo "Not configured")

## Next Steps
1. Access Grafana at http://localhost:3001
2. Review and customize dashboards
3. Configure additional alert rules if needed
4. Set up external monitoring (optional)

## Troubleshooting
- Check service logs: \`docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml logs [service]\`
- Restart monitoring: \`docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml restart\`
- Health check: \`./scripts/setup-monitoring.sh health\`

Generated on: $(date)
EOF

    log "Monitoring summary created: MONITORING_SUMMARY.md"
}

# Health check function
health_check() {
    log "Performing monitoring health check..."
    
    check_service_health
    
    # Check metrics endpoint
    if curl -f "http://localhost:3000/api/metrics" >/dev/null 2>&1; then
        log "✅ Application metrics endpoint is working"
    else
        error "❌ Application metrics endpoint failed"
    fi
    
    # Check if data is flowing
    local prometheus_targets=$(curl -s "http://localhost:9090/api/v1/targets" | grep -o '"health":"up"' | wc -l)
    log "Prometheus targets up: $prometheus_targets"
    
    log "Health check completed"
}

# Main setup function
main() {
    log "Starting QMS monitoring setup..."
    
    check_prerequisites
    setup_directories
    configure_grafana
    setup_alerts
    start_monitoring
    import_dashboards
    setup_log_rotation
    create_summary
    
    log "🎉 Monitoring setup completed successfully!"
    log ""
    log "Access your monitoring dashboards:"
    log "📊 Grafana: http://localhost:3001 (admin/$GRAFANA_PASSWORD)"
    log "📈 Prometheus: http://localhost:9090"
    log "📋 Logs: http://localhost:3100"
    log ""
    log "Check MONITORING_SUMMARY.md for detailed information"
}

# Handle command line arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "health")
        health_check
        ;;
    "restart")
        log "Restarting monitoring services..."
        docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml restart
        ;;
    "stop")
        log "Stopping monitoring services..."
        docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml down
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml logs -f "${2:-}"
        ;;
    *)
        echo "Usage: $0 {setup|health|restart|stop|logs [service]}"
        echo "  setup   - Set up monitoring stack (default)"
        echo "  health  - Check monitoring service health"
        echo "  restart - Restart monitoring services"
        echo "  stop    - Stop monitoring services"
        echo "  logs    - View monitoring service logs"
        exit 1
        ;;
esac