#!/bin/bash

# QMS Production Deployment Script
# This script handles the deployment process for the QMS application

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.local"
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
        echo "Please copy .env.production to $ENV_FILE and configure it"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Create backup before deployment
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        log "Creating backup before deployment..."
        docker-compose -f "$COMPOSE_FILE" run --rm postgres-backup || {
            warn "Backup failed, but continuing with deployment"
        }
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build application image
    log "Building application image..."
    docker-compose -f "$COMPOSE_FILE" build qms-app
    
    # Stop services gracefully
    log "Stopping services..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30
    
    # Start database and cache services first
    log "Starting database and cache services..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Database migrations removed - using Neon Serverless Driver
    log "Database migrations not needed with Neon..."
    
    # Start all services
    log "Starting all services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for application to be ready
    log "Waiting for application to start..."
    sleep 60
    
    # Health check
    health_check
}

# Health check
health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    error "Deployment failed, initiating rollback..."
    
    # Stop current deployment
    docker-compose -f "$COMPOSE_FILE" down
    
    # You could implement more sophisticated rollback logic here
    # For example, restoring from the backup created before deployment
    
    error "Rollback completed. Please check the logs and try again."
    exit 1
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    log "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting QMS deployment process"
    
    # Trap errors and rollback
    trap rollback ERR
    
    check_prerequisites
    create_backup
    deploy
    cleanup
    
    log "Deployment completed successfully!"
    log "Application is available at: http://localhost"
    
    # Show running services
    log "Running services:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "backup")
        create_backup
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|backup|cleanup}"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback the deployment"
        echo "  health   - Check application health"
        echo "  backup   - Create a backup"
        echo "  cleanup  - Clean up old images and containers"
        exit 1
        ;;
esac