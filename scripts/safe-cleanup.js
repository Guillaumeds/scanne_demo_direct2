#!/usr/bin/env node

/**
 * Safe cleanup script that moves potentially unused files to a reference folder
 * instead of deleting them, allowing for easy recovery if needed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SafeCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'reference_notused');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.sessionDir = path.join(this.backupDir, `cleanup_${this.timestamp}`);
  }

  // Create backup directory structure
  createBackupStructure() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }

    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
      console.log(`📁 Created session directory: ${this.sessionDir}`);
    }

    // Create a manifest file to track what was moved
    const manifestPath = path.join(this.sessionDir, 'cleanup-manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      description: 'Files moved during cleanup process',
      canRestore: true,
      movedFiles: []
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifestPath;
  }

  // Move a file to backup directory, preserving directory structure
  moveFileToBackup(filePath, reason = 'Unused') {
    const sourcePath = path.join(this.projectRoot, filePath);
    
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return false;
    }

    // Create the same directory structure in backup
    const backupFilePath = path.join(this.sessionDir, filePath);
    const backupDir = path.dirname(backupFilePath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      // Move the file
      fs.renameSync(sourcePath, backupFilePath);
      console.log(`📦 Moved: ${filePath} → reference_notused/cleanup_${this.timestamp}/${filePath}`);
      
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

  // Update manifest with moved files
  updateManifest(manifestPath, movedFiles) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.movedFiles = movedFiles;
      manifest.totalMoved = movedFiles.length;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch (error) {
      console.error('❌ Failed to update manifest:', error.message);
    }
  }

  // Create restoration script
  createRestorationScript(manifestPath, movedFiles) {
    const restoreScriptPath = path.join(this.sessionDir, 'restore.js');
    const restoreScript = `#!/usr/bin/env node

/**
 * Restoration script for cleanup session ${this.timestamp}
 * Run this script to restore all moved files to their original locations
 */

const fs = require('fs');
const path = require('path');

const projectRoot = '${this.projectRoot}';
const sessionDir = '${this.sessionDir}';

const movedFiles = ${JSON.stringify(movedFiles, null, 2)};

console.log('🔄 Restoring files from cleanup session ${this.timestamp}...');

let restored = 0;
let failed = 0;

for (const file of movedFiles) {
  const backupPath = path.join(sessionDir, file.originalPath);
  const originalPath = path.join(projectRoot, file.originalPath);
  
  try {
    // Create directory if it doesn't exist
    const originalDir = path.dirname(originalPath);
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    
    // Move file back
    fs.renameSync(backupPath, originalPath);
    console.log(\`✅ Restored: \${file.originalPath}\`);
    restored++;
  } catch (error) {
    console.error(\`❌ Failed to restore \${file.originalPath}:\`, error.message);
    failed++;
  }
}

console.log(\`\\n📊 Restoration complete: \${restored} restored, \${failed} failed\`);

if (restored > 0 && failed === 0) {
  console.log('\\n🗑️  You can now safely delete the backup directory:');
  console.log(\`   rm -rf "\${sessionDir}"\`);
}
`;

    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, '755');
    console.log(`📝 Created restoration script: ${restoreScriptPath}`);
  }

  // Interactive cleanup process
  async interactiveCleanup(analysisResults) {
    console.log('\n🧹 Starting interactive cleanup process...');
    
    const manifestPath = this.createBackupStructure();
    const movedFiles = [];

    // Process definitely unused files
    if (analysisResults.definitelyUnused && analysisResults.definitelyUnused.length > 0) {
      console.log(`\\n🗑️  Processing ${analysisResults.definitelyUnused.length} definitely unused files...`);
      
      for (const filePath of analysisResults.definitelyUnused) {
        const moved = this.moveFileToBackup(filePath, 'Definitely unused');
        if (moved) {
          movedFiles.push(moved);
        }
      }
    }

    // Process probably unused files (with confirmation)
    if (analysisResults.probablyUnused && analysisResults.probablyUnused.length > 0) {
      console.log(`\\n⚠️  Found ${analysisResults.probablyUnused.length} probably unused files.`);
      console.log('These will be moved to backup for manual review.');
      
      for (const filePath of analysisResults.probablyUnused) {
        const moved = this.moveFileToBackup(filePath, 'Probably unused');
        if (moved) {
          movedFiles.push(moved);
        }
      }
    }

    // Update manifest and create restoration script
    this.updateManifest(manifestPath, movedFiles);
    this.createRestorationScript(manifestPath, movedFiles);

    console.log(`\\n✅ Cleanup complete! Moved ${movedFiles.length} files to backup.`);
    console.log(`\\n📁 Backup location: ${this.sessionDir}`);
    console.log(`📝 Manifest: ${manifestPath}`);
    console.log(`🔄 To restore files: node ${path.join(this.sessionDir, 'restore.js')}`);
    
    return {
      movedCount: movedFiles.length,
      backupDir: this.sessionDir,
      manifestPath,
      movedFiles
    };
  }

  // Batch cleanup from analysis results
  batchCleanup(analysisResults) {
    console.log('🚀 Starting batch cleanup...');
    
    const manifestPath = this.createBackupStructure();
    const movedFiles = [];

    // Move all unused files
    const filesToMove = [
      ...(analysisResults.definitelyUnused || []),
      ...(analysisResults.probablyUnused || []),
      ...(analysisResults.unused || [])
    ];

    console.log(`📦 Moving ${filesToMove.length} files to backup...`);

    for (const filePath of filesToMove) {
      const moved = this.moveFileToBackup(filePath, 'Batch cleanup');
      if (moved) {
        movedFiles.push(moved);
      }
    }

    this.updateManifest(manifestPath, movedFiles);
    this.createRestorationScript(manifestPath, movedFiles);

    return {
      movedCount: movedFiles.length,
      backupDir: this.sessionDir,
      manifestPath,
      movedFiles
    };
  }

  // Test that the application still works after cleanup
  testApplication() {
    console.log('\\n🧪 Testing application after cleanup...');
    
    try {
      console.log('📝 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed');
      
      console.log('🔍 Running ESLint...');
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('✅ ESLint check passed');
      
      console.log('🏗️  Testing build...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build successful');
      
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      console.log('\\n🔄 Consider restoring files and reviewing the analysis');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new SafeCleanup();
  
  // Check if analysis results exist
  const analysisFiles = [
    'typescript-unused-analysis.json',
    'unused-files-report.json'
  ];
  
  let analysisResults = null;
  
  for (const file of analysisFiles) {
    if (fs.existsSync(file)) {
      try {
        analysisResults = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`📊 Using analysis results from: ${file}`);
        break;
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}:`, error.message);
      }
    }
  }
  
  if (!analysisResults) {
    console.error('❌ No analysis results found. Please run the analysis first:');
    console.log('   node scripts/typescript-unused-analyzer.js');
    console.log('   or');
    console.log('   node scripts/find-unused-files.js');
    process.exit(1);
  }
  
  // Run cleanup
  cleanup.batchCleanup(analysisResults)
    .then(result => {
      console.log(`\\n🎉 Cleanup completed successfully!`);
      console.log(`📦 ${result.movedCount} files moved to backup`);
      
      // Ask if user wants to test the application
      console.log('\\n🧪 Would you like to test the application now? (Recommended)');
      console.log('   Run: node scripts/safe-cleanup.js --test');
    })
    .catch(console.error);
}

module.exports = SafeCleanup;
