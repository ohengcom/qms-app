#!/bin/bash

# QMS Database Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="qms_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Database connection details
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME=${POSTGRES_DB:-"qms_production"}
DB_USER=${POSTGRES_USER:-"qms_user"}

echo "Starting backup process at $(date)"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
echo "Creating database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password --verbose --clean --no-acl --no-owner \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_DIR/$COMPRESSED_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
    echo "Backup created successfully: $COMPRESSED_FILE ($BACKUP_SIZE)"
else
    echo "ERROR: Backup file was not created!"
    exit 1
fi

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "qms_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/qms_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup process completed at $(date)"