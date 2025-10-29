#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Translation keys from i18n.ts
interface TranslationKeys {
  zh: Record<string, any>;
  en: Record<string, any>;
}

// Results interface
interface AuditResult {
  file: string;
  line: number;
  text: string;
  type: 'hardcoded' | 'missing_key' | 'untranslated';
  suggestion?: string;
}

/**
 * Load translation keys from i18n.ts by importing the module
 */
function loadTranslationKeys(): TranslationKeys {
  try {
    // Use dynamic import to load the translations
    // Since we're using tsx, we can directly import TypeScript files
    const i18nPath = path.join(process.cwd(), 'src/lib/i18n.ts');

    // Read and evaluate the file to extract translations
    const content = fs.readFileSync(i18nPath, 'utf-8');

    // Extract the translations object using regex
    const translationsMatch = content.match(/export const translations = ({[\s\S]*?});[\s]*\/\//);

    if (!translationsMatch) {
      throw new Error('Could not find translations object');
    }

    // Use eval to parse the object (safe in this context as we control the source)
    // eslint-disable-next-line no-eval
    const translations = eval(`(${translationsMatch[1]})`);

    return {
      zh: translations.zh || {},
      en: translations.en || {},
    };
  } catch (error) {
    console.error('Error loading translation keys:', error);
    return { zh: {}, en: {} };
  }
}

/**
 * Get all translation keys in dot notation
 */
function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Scan files for hardcoded text and missing translations
 */
async function scanFiles(): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  // Get all TypeScript and TSX files
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['src/lib/i18n.ts', 'node_modules/**'],
  });

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for hardcoded Chinese text
      const chineseRegex = /[\u4e00-\u9fff]+/g;
      const chineseMatches = line.match(chineseRegex);

      if (chineseMatches) {
        for (const match of chineseMatches) {
          // Skip if it's in a comment
          if (line.trim().startsWith('//') || line.includes('/*')) continue;

          // Skip if it's already using t() function
          if (line.includes(`t('`) || line.includes('t("')) continue;

          results.push({
            file,
            line: lineNumber,
            text: match,
            type: 'hardcoded',
            suggestion: `Consider using t('key') for: ${match}`,
          });
        }
      }

      // Check for hardcoded English text in common patterns
      const englishPatterns = [
        /['"`]([A-Z][a-z\s]{10,})['"`]/g, // Capitalized sentences
        /placeholder=['"`]([^'"`,]{5,})['"`]/g, // Placeholder text
        /title=['"`]([^'"`,]{5,})['"`]/g, // Title attributes
        /aria-label=['"`]([^'"`,]{5,})['"`]/g, // ARIA labels
      ];

      for (const pattern of englishPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1];

          // Skip if it's already using t() function
          if (line.includes(`t('`) || line.includes('t("')) continue;

          // Skip common technical terms
          if (/^(http|https|www|api|json|xml|css|js|ts)/.test(text.toLowerCase())) continue;

          results.push({
            file,
            line: lineNumber,
            text,
            type: 'hardcoded',
            suggestion: `Consider using t('key') for: ${text}`,
          });
        }
      }

      // Check for t() calls with potentially missing keys
      const tCallRegex = /t\(['"`]([^'"`,]+)['"`]\)/g;
      let tMatch;

      while ((tMatch = tCallRegex.exec(line)) !== null) {
        const key = tMatch[1];
        // This would need to be checked against actual translation keys
        // For now, we'll just collect them
      }
    }
  }

  return results;
}

/**
 * Generate coverage report
 */
function generateCoverageReport(translationKeys: TranslationKeys): void {
  const zhKeys = flattenKeys(translationKeys.zh);
  const enKeys = flattenKeys(translationKeys.en);

  const allKeys = new Set([...zhKeys, ...enKeys]);
  const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
  const missingInEn = zhKeys.filter(key => !enKeys.includes(key));

  console.log('\n📊 Translation Coverage Report');
  console.log('━'.repeat(50));
  console.log(`Total unique keys: ${allKeys.size}`);
  console.log(`Chinese keys: ${zhKeys.length}`);
  console.log(`English keys: ${enKeys.length}`);
  console.log(
    `Coverage: ${Math.round((Math.min(zhKeys.length, enKeys.length) / allKeys.size) * 100)}%`
  );

  if (missingInZh.length > 0) {
    console.log('\n❌ Missing in Chinese:');
    missingInZh.forEach(key => console.log(`  - ${key}`));
  }

  if (missingInEn.length > 0) {
    console.log('\n❌ Missing in English:');
    missingInEn.forEach(key => console.log(`  - ${key}`));
  }

  if (missingInZh.length === 0 && missingInEn.length === 0) {
    console.log('\n✅ All translation keys are present in both languages!');
  }
}

/**
 * Main audit function
 */
async function auditTranslations() {
  console.log('🔍 Starting Translation Audit...');
  console.log('━'.repeat(50));

  // Load existing translation keys
  console.log('📖 Loading translation keys...');
  const translationKeys = loadTranslationKeys();

  // Generate coverage report
  generateCoverageReport(translationKeys);

  // Scan files for issues
  console.log('\n🔍 Scanning files for hardcoded text...');
  const results = await scanFiles();

  // Group results by type
  const hardcodedResults = results.filter(r => r.type === 'hardcoded');

  console.log('\n📋 Audit Results');
  console.log('━'.repeat(50));

  if (hardcodedResults.length === 0) {
    console.log('✅ No hardcoded text found!');
  } else {
    console.log(`⚠️  Found ${hardcodedResults.length} potential hardcoded text instances:`);
    console.log();

    // Group by file
    const byFile = hardcodedResults.reduce(
      (acc, result) => {
        if (!acc[result.file]) acc[result.file] = [];
        acc[result.file].push(result);
        return acc;
      },
      {} as Record<string, AuditResult[]>
    );

    for (const [file, fileResults] of Object.entries(byFile)) {
      console.log(`📄 ${file}:`);
      for (const result of fileResults) {
        console.log(`  Line ${result.line}: "${result.text}"`);
        if (result.suggestion) {
          console.log(`    💡 ${result.suggestion}`);
        }
      }
      console.log();
    }
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('━'.repeat(50));
  console.log(`Files scanned: ${(await glob('src/**/*.{ts,tsx}')).length}`);
  console.log(`Hardcoded text instances: ${hardcodedResults.length}`);
  console.log(
    `Translation coverage: ${Math.round((Math.min(flattenKeys(translationKeys.zh).length, flattenKeys(translationKeys.en).length) / Math.max(flattenKeys(translationKeys.zh).length, flattenKeys(translationKeys.en).length, 1)) * 100)}%`
  );

  if (hardcodedResults.length > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Review the hardcoded text instances above');
    console.log('2. Add appropriate translation keys to src/lib/i18n.ts');
    console.log("3. Replace hardcoded text with t('key') calls");
    console.log('4. Run this audit again to verify improvements');
  } else {
    console.log('\n🎉 Great! Your translation system looks good!');
  }

  console.log('\n━'.repeat(50));
  console.log('Translation audit complete!');
}

// Run the audit
auditTranslations().catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});
