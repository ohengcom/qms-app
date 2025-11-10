#!/usr/bin/env tsx
/**
 * 项目清理脚本
 * 
 * 功能:
 * 1. 检查并报告需要清理的项目
 * 2. 可选: 自动执行一些安全的清理操作
 * 
 * 使用方法:
 * npm run cleanup:check  # 只检查，不修改
 * npm run cleanup:auto   # 自动执行安全的清理
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface CleanupReport {
  consoleLogs: string[];
  todoComments: string[];
  unusedFiles: string[];
  largeFiles: string[];
  duplicateCode: string[];
}

/**
 * 扫描项目中的 console.log
 */
async function findConsoleLogs(): Promise<string[]> {
  log('\n🔍 扫描 console.log...', 'cyan');
  
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: [
      '**/node_modules/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/lib/logger.ts',
      '**/lib/excel-analyzer.ts', // 分析工具，可以保留
    ],
  });

  const results: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('console.log') || line.includes('console.error')) {
        // 跳过注释中的
        if (line.trim().startsWith('//')) return;
        
        results.push(`${file}:${index + 1} - ${line.trim()}`);
      }
    });
  }

  return results;
}

/**
 * 扫描 TODO 注释
 */
async function findTodoComments(): Promise<string[]> {
  log('\n🔍 扫描 TODO 注释...', 'cyan');
  
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**'],
  });

  const results: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
        results.push(`${file}:${index + 1} - ${line.trim()}`);
      }
    });
  }

  return results;
}

/**
 * 查找可能未使用的文件
 */
async function findUnusedFiles(): Promise<string[]> {
  log('\n🔍 扫描可能未使用的文件...', 'cyan');
  
  const suspiciousPatterns = [
    'scripts/test-*.ts',
    'scripts/*-test.ts',
    '**/*.backup.*',
    '**/*.old.*',
    '**/*.tmp.*',
  ];

  const results: string[] = [];

  for (const pattern of suspiciousPatterns) {
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**'],
    });
    results.push(...files);
  }

  return results;
}

/**
 * 查找大文件
 */
async function findLargeFiles(): Promise<string[]> {
  log('\n🔍 扫描大文件 (>100KB)...', 'cyan');
  
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**'],
  });

  const results: string[] = [];
  const sizeLimit = 100 * 1024; // 100KB

  for (const file of files) {
    const stats = fs.statSync(file);
    if (stats.size > sizeLimit) {
      const sizeKB = (stats.size / 1024).toFixed(2);
      results.push(`${file} - ${sizeKB}KB`);
    }
  }

  return results;
}

/**
 * 查找可能重复的代码
 */
async function findDuplicateCode(): Promise<string[]> {
  log('\n🔍 扫描可能重复的组件...', 'cyan');
  
  const duplicatePairs = [
    ['src/components/ui/skeleton.tsx', 'src/components/ui/skeleton-layouts.tsx'],
    ['src/components/ui/button.tsx', 'src/components/ui/ripple-button.tsx'],
    ['src/components/ui/next-image.tsx', 'src/components/ui/optimized-image.tsx'],
  ];

  const results: string[] = [];

  for (const [file1, file2] of duplicatePairs) {
    if (fs.existsSync(file1) && fs.existsSync(file2)) {
      results.push(`可能重复: ${file1} <-> ${file2}`);
    }
  }

  return results;
}

/**
 * 生成清理报告
 */
async function generateReport(): Promise<CleanupReport> {
  log('\n📊 生成清理报告...', 'blue');
  log('=' .repeat(60), 'blue');

  const report: CleanupReport = {
    consoleLogs: await findConsoleLogs(),
    todoComments: await findTodoComments(),
    unusedFiles: await findUnusedFiles(),
    largeFiles: await findLargeFiles(),
    duplicateCode: await findDuplicateCode(),
  };

  return report;
}

/**
 * 打印报告
 */
function printReport(report: CleanupReport) {
  log('\n📋 清理报告', 'magenta');
  log('=' .repeat(60), 'magenta');

  // Console Logs
  log(`\n🔴 Console Logs (${report.consoleLogs.length} 处)`, 'red');
  if (report.consoleLogs.length > 0) {
    report.consoleLogs.slice(0, 10).forEach(item => {
      log(`  - ${item}`, 'yellow');
    });
    if (report.consoleLogs.length > 10) {
      log(`  ... 还有 ${report.consoleLogs.length - 10} 处`, 'yellow');
    }
  } else {
    log('  ✅ 未发现问题', 'green');
  }

  // TODO Comments
  log(`\n🟡 TODO 注释 (${report.todoComments.length} 处)`, 'yellow');
  if (report.todoComments.length > 0) {
    report.todoComments.slice(0, 10).forEach(item => {
      log(`  - ${item}`, 'yellow');
    });
    if (report.todoComments.length > 10) {
      log(`  ... 还有 ${report.todoComments.length - 10} 处`, 'yellow');
    }
  } else {
    log('  ✅ 未发现问题', 'green');
  }

  // Unused Files
  log(`\n🗑️  可能未使用的文件 (${report.unusedFiles.length} 个)`, 'cyan');
  if (report.unusedFiles.length > 0) {
    report.unusedFiles.forEach(item => {
      log(`  - ${item}`, 'yellow');
    });
  } else {
    log('  ✅ 未发现问题', 'green');
  }

  // Large Files
  log(`\n📦 大文件 (${report.largeFiles.length} 个)`, 'blue');
  if (report.largeFiles.length > 0) {
    report.largeFiles.forEach(item => {
      log(`  - ${item}`, 'yellow');
    });
  } else {
    log('  ✅ 未发现问题', 'green');
  }

  // Duplicate Code
  log(`\n🔄 可能重复的代码 (${report.duplicateCode.length} 对)`, 'magenta');
  if (report.duplicateCode.length > 0) {
    report.duplicateCode.forEach(item => {
      log(`  - ${item}`, 'yellow');
    });
  } else {
    log('  ✅ 未发现问题', 'green');
  }

  // Summary
  log('\n📊 总结', 'cyan');
  log('=' .repeat(60), 'cyan');
  const totalIssues =
    report.consoleLogs.length +
    report.todoComments.length +
    report.unusedFiles.length +
    report.largeFiles.length +
    report.duplicateCode.length;

  if (totalIssues === 0) {
    log('✅ 项目很干净！没有发现需要清理的项目。', 'green');
  } else {
    log(`⚠️  发现 ${totalIssues} 个需要关注的项目`, 'yellow');
    log('\n建议:', 'cyan');
    log('  1. 查看 PROJECT_OPTIMIZATION_ANALYSIS.md 了解详细分析', 'cyan');
    log('  2. 查看 CLEANUP_EXECUTION_PLAN.md 了解执行计划', 'cyan');
    log('  3. 逐步执行清理任务', 'cyan');
  }

  log('\n' + '=' .repeat(60), 'blue');
}

/**
 * 自动清理（安全操作）
 */
async function autoCleanup() {
  log('\n🤖 执行自动清理...', 'green');
  log('=' .repeat(60), 'green');

  // 1. 创建归档目录
  log('\n📁 创建归档目录...', 'cyan');
  const archiveDirs = [
    'scripts/archive',
    'scripts/migrations',
    'docs/archive/temp',
  ];

  for (const dir of archiveDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`  ✅ 创建: ${dir}`, 'green');
    } else {
      log(`  ⏭️  已存在: ${dir}`, 'yellow');
    }
  }

  // 2. 移动测试脚本到归档
  log('\n📦 归档测试脚本...', 'cyan');
  const testScripts = [
    'scripts/test-edge-runtime-fix.ts',
    'scripts/test-env.ts',
    'scripts/test-session1-improvements.ts',
    'scripts/test-session2-improvements.ts',
    'scripts/test-session3-api-consolidation.ts',
    'scripts/test-ui-fixes.ts',
  ];

  for (const script of testScripts) {
    if (fs.existsSync(script)) {
      const dest = script.replace('scripts/', 'scripts/archive/');
      fs.renameSync(script, dest);
      log(`  ✅ 移动: ${script} -> ${dest}`, 'green');
    }
  }

  // 3. 移动迁移脚本
  log('\n📦 归档迁移脚本...', 'cyan');
  const migrationScripts = [
    'scripts/migrate-available-to-storage.ts',
    'scripts/migrate-to-unified-usage-table.ts',
    'scripts/drop-old-usage-tables.ts',
    'scripts/run-migration-006.ts',
    'scripts/run-migration-007.ts',
  ];

  for (const script of migrationScripts) {
    if (fs.existsSync(script)) {
      const dest = script.replace('scripts/', 'scripts/migrations/');
      fs.renameSync(script, dest);
      log(`  ✅ 移动: ${script} -> ${dest}`, 'green');
    }
  }

  // 4. 归档临时文档
  log('\n📄 归档临时文档...', 'cyan');
  const tempDocs = [
    'HYDRATION_ERROR_FIX.md',
    'IMAGE_ISSUE_SUMMARY.md',
    'IMAGE_DEBUG_GUIDE.md',
    'CACHE_CLEAR_INSTRUCTIONS.md',
  ];

  for (const doc of tempDocs) {
    if (fs.existsSync(doc)) {
      const dest = `docs/archive/temp/${doc}`;
      fs.renameSync(doc, dest);
      log(`  ✅ 移动: ${doc} -> ${dest}`, 'green');
    }
  }

  log('\n✅ 自动清理完成！', 'green');
  log('\n⚠️  注意: 以下任务需要手动完成:', 'yellow');
  log('  1. 替换 console.log 为 logger', 'yellow');
  log('  2. 处理 TODO 注释', 'yellow');
  log('  3. 修复天气功能', 'yellow');
  log('  4. 更新文档', 'yellow');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'check';

  log('\n🧹 QMS 项目清理工具', 'blue');
  log('=' .repeat(60), 'blue');

  if (mode === 'auto') {
    // 先生成报告
    const report = await generateReport();
    printReport(report);

    // 询问是否继续
    log('\n⚠️  即将执行自动清理操作', 'yellow');
    log('这将移动一些文件到归档目录', 'yellow');
    log('按 Ctrl+C 取消，或等待 5 秒自动继续...', 'yellow');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await autoCleanup();
  } else {
    // 只检查
    const report = await generateReport();
    printReport(report);

    log('\n💡 提示:', 'cyan');
    log('  运行 npm run cleanup:auto 执行自动清理', 'cyan');
  }
}

// 运行
main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  process.exit(1);
});
