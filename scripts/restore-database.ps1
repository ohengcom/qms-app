# QMS Database Restore Script
# Usage: .\scripts\restore-database.ps1 -BackupFile "path/to/backup.sql" [-Force]

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [switch]$Force,
    [switch]$Verbose
)

# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "`n=== QMS Database Restore ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 检查备份文件是否存在
if (!(Test-Path $BackupFile)) {
    Write-Host "ERROR: Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

$fileInfo = Get-Item $BackupFile
Write-Host "`nBackup file: $($fileInfo.FullName)" -ForegroundColor Cyan
Write-Host "File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
Write-Host "Created: $($fileInfo.CreationTime)" -ForegroundColor Gray

# 警告提示
Write-Host "`n⚠️  WARNING: This will overwrite ALL data in the database!" -ForegroundColor Yellow
Write-Host "   - All existing quilts will be replaced" -ForegroundColor Yellow
Write-Host "   - All usage records will be replaced" -ForegroundColor Yellow
Write-Host "   - All settings will be replaced" -ForegroundColor Yellow

if (!$Force) {
    Write-Host "`nType 'yes' to continue or anything else to cancel:" -ForegroundColor Yellow
    $confirm = Read-Host
    if ($confirm -ne "yes") {
        Write-Host "Restore cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# 检查 .env.local 文件
if (!(Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
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

# 检查 psql 是否可用
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "ERROR: psql not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nStarting restore..." -ForegroundColor Green

# 创建恢复前的备份
Write-Host "Creating pre-restore backup..." -ForegroundColor Yellow
$preRestoreBackup = "backups/pre_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
try {
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    $dumpProcess = Start-Process -FilePath "pg_dump" -ArgumentList $dbUrl -NoNewWindow -PassThru -RedirectStandardOutput $preRestoreBackup -Wait
    if ($dumpProcess.ExitCode -eq 0) {
        Write-Host "Pre-restore backup saved: $preRestoreBackup" -ForegroundColor Green
    }
} catch {
    Write-Host "Warning: Failed to create pre-restore backup" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
}

# 执行恢复
try {
    # 检查是否是压缩文件
    $isCompressed = $BackupFile -like "*.gz" -or $BackupFile -like "*.zip"
    
    if ($isCompressed) {
        Write-Host "Decompressing backup file..." -ForegroundColor Yellow
        $tempFile = "temp_restore.sql"
        
        if ($BackupFile -like "*.gz") {
            # 解压 gzip
            Expand-Archive -Path $BackupFile -DestinationPath "." -Force
            $tempFile = $BackupFile -replace '\.gz$', ''
        } else {
            # 解压 zip
            Expand-Archive -Path $BackupFile -DestinationPath "." -Force
            $tempFile = (Get-ChildItem -Filter "*.sql" | Select-Object -First 1).Name
        }
        
        $restoreFile = $tempFile
    } else {
        $restoreFile = $BackupFile
    }
    
    if ($Verbose) {
        Write-Host "Running: psql < $restoreFile" -ForegroundColor Gray
    }
    
    # 执行恢复
    $restoreProcess = Start-Process -FilePath "psql" -ArgumentList $dbUrl -NoNewWindow -PassThru -RedirectStandardInput $restoreFile -Wait
    
    # 清理临时文件
    if ($isCompressed -and (Test-Path $tempFile)) {
        Remove-Item $tempFile
    }
    
    if ($restoreProcess.ExitCode -eq 0) {
        Write-Host "`nRestore completed successfully!" -ForegroundColor Green
        
        # 验证数据
        Write-Host "`nVerifying data..." -ForegroundColor Yellow
        $verifyScript = @"
SELECT 
    'quilts' as table_name, COUNT(*) as count FROM quilts
UNION ALL
SELECT 
    'usage_records', COUNT(*) FROM usage_records
UNION ALL
SELECT 
    'notifications', COUNT(*) FROM notifications;
"@
        
        $verifyFile = "temp_verify.sql"
        $verifyScript | Out-File -FilePath $verifyFile -Encoding UTF8
        
        Write-Host "Data counts:" -ForegroundColor Cyan
        psql $dbUrl -f $verifyFile
        
        Remove-Item $verifyFile
        
        Write-Host "`n✓ Database restored successfully!" -ForegroundColor Green
        Write-Host "Pre-restore backup saved at: $preRestoreBackup" -ForegroundColor Cyan
        
    } else {
        throw "psql failed with exit code $($restoreProcess.ExitCode)"
    }
    
} catch {
    Write-Host "`nRestore failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nYou can restore from the pre-restore backup:" -ForegroundColor Yellow
    Write-Host "  .\scripts\restore-database.ps1 -BackupFile `"$preRestoreBackup`" -Force" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nDone!" -ForegroundColor Green
