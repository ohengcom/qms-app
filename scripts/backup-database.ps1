# QMS Database Backup Script
# Usage: .\scripts\backup-database.ps1 [-BackupDir "path"] [-Compress]

param(
    [string]$BackupDir = "backups",
    [switch]$Compress,
    [switch]$Verbose
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 创建备份目录
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Green
}

# 生成备份文件名
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$BackupDir/qms_backup_$timestamp.sql"

Write-Host "`n=== QMS Database Backup ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 检查 .env.local 文件
if (!(Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# 从 .env.local 读取数据库 URL
try {
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match 'DATABASE_URL\s*=\s*["\']?([^"\'\r\n]+)["\']?') {
        $dbUrl = $matches[1]
    } else {
        throw "DATABASE_URL not found in .env.local"
    }
} catch {
    Write-Host "ERROR: Failed to read DATABASE_URL from .env.local" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 检查 pg_dump 是否可用
try {
    $null = Get-Command pg_dump -ErrorAction Stop
} catch {
    Write-Host "ERROR: pg_dump not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql" -ForegroundColor Yellow
    Write-Host "  or download from https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting backup..." -ForegroundColor Green

# 执行备份
try {
    if ($Compress) {
        $backupFile = "$backupFile.gz"
        if ($Verbose) {
            Write-Host "Running: pg_dump | gzip > $backupFile" -ForegroundColor Gray
        }
        
        # 使用 PowerShell 压缩
        $dumpProcess = Start-Process -FilePath "pg_dump" -ArgumentList $dbUrl -NoNewWindow -PassThru -RedirectStandardOutput "temp_dump.sql" -Wait
        
        if ($dumpProcess.ExitCode -eq 0) {
            # 压缩文件
            Compress-Archive -Path "temp_dump.sql" -DestinationPath "$backupFile.zip" -Force
            Remove-Item "temp_dump.sql"
            Rename-Item "$backupFile.zip" $backupFile
        } else {
            throw "pg_dump failed with exit code $($dumpProcess.ExitCode)"
        }
    } else {
        if ($Verbose) {
            Write-Host "Running: pg_dump > $backupFile" -ForegroundColor Gray
        }
        
        $dumpProcess = Start-Process -FilePath "pg_dump" -ArgumentList $dbUrl -NoNewWindow -PassThru -RedirectStandardOutput $backupFile -Wait
        
        if ($dumpProcess.ExitCode -ne 0) {
            throw "pg_dump failed with exit code $($dumpProcess.ExitCode)"
        }
    }
    
    Write-Host "`nBackup completed successfully!" -ForegroundColor Green
    Write-Host "Backup file: $backupFile" -ForegroundColor Cyan
    
    # 显示文件大小
    $fileInfo = Get-Item $backupFile
    $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    Write-Host "File size: $sizeMB MB" -ForegroundColor Cyan
    Write-Host "Created: $($fileInfo.CreationTime)" -ForegroundColor Gray
    
    # 清理旧备份（保留最近 30 个）
    $backupFiles = Get-ChildItem -Path $BackupDir -Filter "qms_backup_*.sql*" | Sort-Object CreationTime -Descending
    if ($backupFiles.Count -gt 30) {
        $filesToDelete = $backupFiles | Select-Object -Skip 30
        Write-Host "`nCleaning up old backups..." -ForegroundColor Yellow
        foreach ($file in $filesToDelete) {
            Remove-Item $file.FullName
            Write-Host "  Deleted: $($file.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n=== Backup Summary ===" -ForegroundColor Cyan
    Write-Host "Total backups: $($backupFiles.Count)" -ForegroundColor Gray
    Write-Host "Oldest backup: $($backupFiles[-1].CreationTime)" -ForegroundColor Gray
    Write-Host "Newest backup: $($backupFiles[0].CreationTime)" -ForegroundColor Gray
    
} catch {
    Write-Host "`nBackup failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # 清理失败的备份文件
    if (Test-Path $backupFile) {
        Remove-Item $backupFile
    }
    if (Test-Path "temp_dump.sql") {
        Remove-Item "temp_dump.sql"
    }
    
    exit 1
}

Write-Host "`nDone!" -ForegroundColor Green
