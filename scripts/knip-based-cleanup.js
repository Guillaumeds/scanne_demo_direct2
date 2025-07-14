#!/usr/bin/env node

/**
 * Professional cleanup script using Knip analysis
 * Based on community best practices and Knip recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class KnipBasedCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'reference_notused');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.sessionDir = path.join(this.backupDir, `knip_cleanup_${this.timestamp}`);
  }

  // Run Knip and parse results
  async runKnipAnalysis() {
    console.log('🔍 Running Knip analysis...');
    
    try {
      const output = execSync('npx knip --reporter json', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      return JSON.parse(output);
    } catch (error) {
      // Knip returns exit code 1 when it finds issues, but still outputs JSON
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout);
        } catch (parseError) {
          console.error('❌ Failed to parse Knip output:', parseError.message);
          return null;
        }
      }
      console.error('❌ Knip analysis failed:', error.message);
      return null;
    }
  }

  // Create backup directory structure
  createBackupStructure() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    
    const manifestPath = path.join(this.sessionDir, 'knip-cleanup-manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      description: 'Knip-based cleanup session',
      knipVersion: this.getKnipVersion(),
      movedFiles: [],
      removedDependencies: []
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifestPath;
  }

  // Get Knip version for manifest
  getKnipVersion() {
    try {
      const output = execSync('npx knip --version', { encoding: 'utf8' });
      return output.trim();
    } catch (error) {
      return 'unknown';
    }
  }

  // Move file to backup
  moveFileToBackup(filePath, reason = 'Knip unused file') {
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
      console.log(`📦 Moved: ${filePath}`);
      
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

  // Clean up unused dependencies from package.json
  cleanupDependencies(knipResults) {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const removedDeps = [];

    // Process unused dependencies
    if (knipResults.dependencies) {
      for (const dep of knipResults.dependencies) {
        if (packageJson.dependencies && packageJson.dependencies[dep.name]) {
          console.log(`🗑️  Removing dependency: ${dep.name}`);
          delete packageJson.dependencies[dep.name];
          removedDeps.push({ name: dep.name, type: 'dependency' });
        }
      }
    }

    // Process unused devDependencies
    if (knipResults.devDependencies) {
      for (const dep of knipResults.devDependencies) {
        if (packageJson.devDependencies && packageJson.devDependencies[dep.name]) {
          console.log(`🗑️  Removing devDependency: ${dep.name}`);
          delete packageJson.devDependencies[dep.name];
          removedDeps.push({ name: dep.name, type: 'devDependency' });
        }
      }
    }

    // Save updated package.json
    if (removedDeps.length > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated package.json - removed ${removedDeps.length} dependencies`);
    }

    return removedDeps;
  }

  // Main cleanup process
  async performCleanup() {
    console.log('🚀 Starting Knip-based cleanup...');
    
    const knipResults = await this.runKnipAnalysis();
    if (!knipResults) {
      console.error('❌ Cannot proceed without Knip analysis');
      return null;
    }

    const manifestPath = this.createBackupStructure();
    const movedFiles = [];
    const removedDependencies = [];

    // Clean up unused files
    if (knipResults.files && knipResults.files.length > 0) {
      console.log(`\n📁 Processing ${knipResults.files.length} unused files...`);

      for (const filePath of knipResults.files) {
        // Knip returns files as an array of strings
        if (filePath && typeof filePath === 'string') {
          const moved = this.moveFileToBackup(filePath, 'Knip unused file');
          if (moved) {
            movedFiles.push(moved);
          }
        }
      }
    }

    // Clean up dependencies (optional - ask user first)
    console.log('\n📦 Dependency cleanup available but skipped for safety.');
    console.log('Run with --deps flag to clean up dependencies.');

    // Update manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.movedFiles = movedFiles;
    manifest.removedDependencies = removedDependencies;
    manifest.totalMoved = movedFiles.length;
    manifest.knipResults = knipResults;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Create restoration script
    this.createRestorationScript(manifestPath, movedFiles);

    console.log(`\n✅ Cleanup complete!`);
    console.log(`📦 Moved ${movedFiles.length} files to: ${this.sessionDir}`);
    console.log(`📝 Full Knip results saved in manifest`);
    
    return {
      movedCount: movedFiles.length,
      backupDir: this.sessionDir,
      manifestPath,
      movedFiles,
      knipResults
    };
  }

  // Create restoration script
  createRestorationScript(manifestPath, movedFiles) {
    const restoreScriptPath = path.join(this.sessionDir, 'restore-knip-cleanup.js');
    const restoreScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = '${this.projectRoot}';
const sessionDir = '${this.sessionDir}';

const movedFiles = ${JSON.stringify(movedFiles, null, 2)};

console.log('🔄 Restoring files from Knip cleanup session...');

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
  async testApplication() {
    console.log('\n🧪 Testing application after cleanup...');
    
    try {
      console.log('📝 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed');
      
      console.log('🔍 Running Knip again to verify...');
      execSync('npm run knip', { stdio: 'inherit' });
      console.log('✅ Knip verification passed');
      
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      console.log('\n🔄 Consider restoring files and reviewing the analysis');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new KnipBasedCleanup();
  
  cleanup.performCleanup()
    .then(result => {
      if (result) {
        console.log(`\n🎉 Knip-based cleanup completed successfully!`);
        console.log(`📦 ${result.movedCount} files moved to backup`);
        console.log(`\n🧪 Test your application:`);
        console.log('   npm run build');
        console.log('   npm run dev');
        console.log(`\n🔄 To restore files:`);
        console.log(`   node "${path.join(result.backupDir, 'restore-knip-cleanup.js')}"`);
      }
    })
    .catch(console.error);
}

module.exports = KnipBasedCleanup;
