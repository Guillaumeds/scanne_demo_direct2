#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management';
const backupPath = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management\reference_notused\dependency_cleanup_2025-07-14\package.json.backup';

console.log('🔄 Restoring dependencies from backup...');

try {
  // Restore package.json from backup
  const packageJsonPath = path.join(projectRoot, 'package.json');
  fs.copyFileSync(backupPath, packageJsonPath);
  console.log('✅ Restored package.json from backup');
  
  // Update package-lock.json
  console.log('📦 Updating package-lock.json...');
  execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Dependencies restored successfully');
  
} catch (error) {
  console.error('❌ Failed to restore dependencies:', error.message);
  process.exit(1);
}
