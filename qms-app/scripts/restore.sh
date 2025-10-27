#!/bin/bash

# QMS Database Restore Script
# This script restores a PostgreSQL database from a backup file

set -e

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -1 /backups/qms_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="/backups"

# Database connection details
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME=${POSTGRES_DB:-"qms_production"}
DB_USER=${POSTGRES_USER:-"qms_user"}

echo "Starting restore process at $(date)"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "ERROR: Backup file $BACKUP_DIR/$BACKUP_FILE not found!"
    exit 1
fi

# Confirm restore operation
echo "WARNING: This will replace all data in database '$DB_NAME'"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Create temporary directory for extraction
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Extract backup if it's compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Extracting compressed backup..."
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$TEMP_DIR/backup.sql"
    SQL_FILE="$TEMP_DIR/backup.sql"
else
    SQL_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Stop application to prevent new connections
echo "Stopping application..."
docker-compose -f docker-compose.prod.yml stop qms-app || true

# Wait for connections to close
sleep 5

# Restore database
echo "Restoring database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password --quiet < "$SQL_FILE"

# Restart application
echo "Starting application..."
docker-compose -f docker-compose.prod.yml start qms-app

echo "Restore process completed at $(date)"
echo "Database '$DB_NAME' has been restored from $BACKUP_FILE"