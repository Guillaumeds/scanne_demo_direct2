#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management';
const sessionDir = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management\reference_notused\legacy_cleanup_2025-07-14';

const movedFiles = [
  {
    "originalPath": "legacy ts/activities.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\activities.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:35.933Z"
  },
  {
    "originalPath": "legacy ts/attachments.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\attachments.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:35.952Z"
  },
  {
    "originalPath": "legacy ts/observations.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\observations.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:35.963Z"
  },
  {
    "originalPath": "legacy ts/products.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\products.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:35.978Z"
  },
  {
    "originalPath": "legacy ts/resources.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\resources.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:35.995Z"
  },
  {
    "originalPath": "legacy ts/varieties.ts",
    "backupPath": "reference_notused\\legacy_cleanup_2025-07-14\\legacy ts\\varieties.ts",
    "reason": "Confirmed legacy file",
    "timestamp": "2025-07-14T03:08:36.005Z"
  }
];

console.log('🔄 Restoring legacy files...');

let restored = 0;
let failed = 0;

for (const file of movedFiles) {
  const backupPath = path.join(sessionDir, file.originalPath);
  const originalPath = path.join(projectRoot, file.originalPath);
  
  try {
    const originalDir = path.dirname(originalPath);
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    
    fs.renameSync(backupPath, originalPath);
    console.log(`✅ Restored: ${file.originalPath}`);
    restored++;
  } catch (error) {
    console.error(`❌ Failed to restore ${file.originalPath}:`, error.message);
    failed++;
  }
}

console.log(`\n📊 Restoration complete: ${restored} restored, ${failed} failed`);
