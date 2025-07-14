#!/usr/bin/env node

/**
 * Safe cleanup script specifically for legacy files
 * Moves obvious legacy files to backup directory
 */

const fs = require('fs');
const path = require('path');

class LegacyFileCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'reference_notused');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.sessionDir = path.join(this.backupDir, `legacy_cleanup_${this.timestamp}`);
  }

  // Create backup directory
  createBackupStructure() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    
    const manifestPath = path.join(this.sessionDir, 'legacy-cleanup-manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      description: 'Legacy files cleanup session',
      movedFiles: []
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifestPath;
  }

  // Move file to backup
  moveFileToBackup(filePath, reason = 'Legacy file') {
    const sourcePath = path.join(this.projectRoot, filePath);
    
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const backupFilePath = path.join(this.sessionDir, filePath);
    const backupDir = path.dirname(backupFilePath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      fs.renameSync(sourcePath, backupFilePath);
      console.log(`📦 Moved: ${filePath} → ${path.relative(this.projectRoot, backupFilePath)}`);
      
      return {
        originalPath: filePath,
        backupPath: path.relative(this.projectRoot, backupFilePath),
        reason: reason,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to move ${filePath}:`, error.message);
      return false;
    }
  }

  // Clean up legacy files
  cleanupLegacyFiles() {
    console.log('🧹 Starting legacy file cleanup...');
    
    const manifestPath = this.createBackupStructure();
    const movedFiles = [];

    // Define legacy files to move
    const legacyFiles = [
      'legacy ts/activities.ts',
      'legacy ts/attachments.ts',
      'legacy ts/observations.ts',
      'legacy ts/products.ts',
      'legacy ts/resources.ts',
      'legacy ts/varieties.ts'
    ];

    // Additional files that might be legacy (check if they exist)
    const potentialLegacyFiles = [
      // Add any other files you suspect are legacy
    ];

    console.log(`📁 Moving ${legacyFiles.length} confirmed legacy files...`);

    // Move confirmed legacy files
    for (const filePath of legacyFiles) {
      const moved = this.moveFileToBackup(filePath, 'Confirmed legacy file');
      if (moved) {
        movedFiles.push(moved);
      }
    }

    // Check for potential legacy files
    for (const filePath of potentialLegacyFiles) {
      if (fs.existsSync(path.join(this.projectRoot, filePath))) {
        const moved = this.moveFileToBackup(filePath, 'Potential legacy file');
        if (moved) {
          movedFiles.push(moved);
        }
      }
    }

    // Update manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.movedFiles = movedFiles;
    manifest.totalMoved = movedFiles.length;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Create restoration script
    this.createRestorationScript(movedFiles);

    console.log(`\n✅ Legacy cleanup complete!`);
    console.log(`📦 Moved ${movedFiles.length} files to: ${this.sessionDir}`);
    console.log(`📝 Manifest: ${manifestPath}`);
    
    return {
      movedCount: movedFiles.length,
      backupDir: this.sessionDir,
      manifestPath,
      movedFiles
    };
  }

  // Create restoration script
  createRestorationScript(movedFiles) {
    const restoreScriptPath = path.join(this.sessionDir, 'restore-legacy.js');
    const restoreScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = '${this.projectRoot}';
const sessionDir = '${this.sessionDir}';

const movedFiles = ${JSON.stringify(movedFiles, null, 2)};

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
    console.log(\`✅ Restored: \${file.originalPath}\`);
    restored++;
  } catch (error) {
    console.error(\`❌ Failed to restore \${file.originalPath}:\`, error.message);
    failed++;
  }
}

console.log(\`\\n📊 Restoration complete: \${restored} restored, \${failed} failed\`);
`;

    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, '755');
    console.log(`🔄 Created restoration script: ${restoreScriptPath}`);
  }

  // Test application after cleanup
  testApplication() {
    console.log('\n🧪 Testing application after legacy cleanup...');
    
    try {
      const { execSync } = require('child_process');
      
      console.log('📝 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed');
      
      console.log('🔍 Running ESLint...');
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ ESLint check passed');
      
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      console.log('\n🔄 Consider restoring files if needed');
      return false;
    }
  }
}

// Run the cleanup
if (require.main === module) {
  const cleanup = new LegacyFileCleanup();
  
  const result = cleanup.cleanupLegacyFiles();
  
  console.log('\n🧪 Would you like to test the application now?');
  console.log('Run the following commands to verify everything still works:');
  console.log('  npx tsc --noEmit');
  console.log('  npm run lint');
  console.log('  npm run build');
  
  console.log('\n🔄 If you need to restore files:');
  console.log(`  node "${path.join(result.backupDir, 'restore-legacy.js')}"`);
}

module.exports = LegacyFileCleanup;
