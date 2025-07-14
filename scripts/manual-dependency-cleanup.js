#!/usr/bin/env node

/**
 * Manual dependency cleanup based on Knip analysis results
 * Removes the specific unused dependencies identified by Knip
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ManualDependencyCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'reference_notused');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.sessionDir = path.join(this.backupDir, `manual_dependency_cleanup_${this.timestamp}`);
    
    // Based on Knip analysis output
    this.unusedDependencies = [
      '@carbon/react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-toast',
      '@tabler/icons',
      '@tanstack/react-table',
      '@tremor/react',
      'critters',
      'leaflet-draw',
      'playwright',
      'react-arborist',
      'react-beautiful-dnd',
      'react-icons',
      'react-leaflet',
      'weather-icons'
    ];
    
    this.unusedDevDependencies = [
      'tsx'
    ];
  }

  // Create backup directory and backup package.json
  createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const backupPath = path.join(this.sessionDir, 'package.json.backup');
    
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log(`📦 Created package.json backup: ${backupPath}`);
    
    return backupPath;
  }

  // Remove dependencies from package.json
  removeDependencies() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const removedDeps = [];

    console.log('\n📦 Removing unused dependencies...');

    // Remove regular dependencies
    if (this.unusedDependencies.length > 0) {
      console.log(`\n🗑️  Removing ${this.unusedDependencies.length} unused dependencies:`);
      for (const depName of this.unusedDependencies) {
        if (packageJson.dependencies && packageJson.dependencies[depName]) {
          console.log(`  - ${depName}`);
          delete packageJson.dependencies[depName];
          removedDeps.push({ name: depName, type: 'dependency' });
        }
      }
    }

    // Remove devDependencies
    if (this.unusedDevDependencies.length > 0) {
      console.log(`\n🗑️  Removing ${this.unusedDevDependencies.length} unused devDependencies:`);
      for (const depName of this.unusedDevDependencies) {
        if (packageJson.devDependencies && packageJson.devDependencies[depName]) {
          console.log(`  - ${depName}`);
          delete packageJson.devDependencies[depName];
          removedDeps.push({ name: depName, type: 'devDependency' });
        }
      }
    }

    // Save updated package.json
    if (removedDeps.length > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`\n✅ Updated package.json - removed ${removedDeps.length} dependencies`);
    } else {
      console.log('\n✅ No dependencies to remove');
    }

    return removedDeps;
  }

  // Update package-lock.json
  updateLockFile() {
    console.log('\n📦 Updating package-lock.json...');
    
    try {
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      console.log('✅ Package-lock.json updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to update package-lock.json:', error.message);
      return false;
    }
  }

  // Create restoration script
  createRestorationScript(backupPath, removedDeps) {
    const restoreScriptPath = path.join(this.sessionDir, 'restore-dependencies.js');
    const restoreScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = '${this.projectRoot}';
const backupPath = '${backupPath}';

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
`;

    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, '755');
    console.log(`🔄 Created restoration script: ${restoreScriptPath}`);
    
    return restoreScriptPath;
  }

  // Save cleanup manifest
  saveManifest(removedDeps, backupPath) {
    const manifestPath = path.join(this.sessionDir, 'dependency-cleanup-manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      description: 'Manual dependency cleanup based on Knip analysis',
      removedDependencies: removedDeps,
      totalRemoved: removedDeps.length,
      backupPath: backupPath,
      unusedDependencies: this.unusedDependencies,
      unusedDevDependencies: this.unusedDevDependencies
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📝 Saved cleanup manifest: ${manifestPath}`);
    
    return manifestPath;
  }

  // Main cleanup process
  performCleanup() {
    console.log('🚀 Starting manual dependency cleanup...');
    console.log(`📊 Target dependencies: ${this.unusedDependencies.length} regular, ${this.unusedDevDependencies.length} dev`);

    const backupPath = this.createBackup();
    const removedDeps = this.removeDependencies();
    
    if (removedDeps.length === 0) {
      console.log('✅ No dependencies were removed (they may have already been cleaned up)');
      return null;
    }

    const lockFileUpdated = this.updateLockFile();
    
    if (!lockFileUpdated) {
      console.error('❌ Failed to update lock file - consider restoring from backup');
      return null;
    }

    const restoreScriptPath = this.createRestorationScript(backupPath, removedDeps);
    const manifestPath = this.saveManifest(removedDeps, backupPath);

    console.log(`\n✅ Dependency cleanup complete!`);
    console.log(`📦 Removed ${removedDeps.length} dependencies`);
    console.log(`💾 Backup: ${backupPath}`);
    console.log(`🔄 Restore: node "${restoreScriptPath}"`);
    
    return {
      removedCount: removedDeps.length,
      backupPath,
      restoreScriptPath,
      manifestPath,
      removedDeps
    };
  }

  // Test application after cleanup
  testApplication() {
    console.log('\n🧪 Testing application after dependency cleanup...');
    
    try {
      console.log('📝 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed');
      
      console.log('🏗️  Testing build...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build successful');
      
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      console.log('\n🔄 Consider restoring dependencies');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new ManualDependencyCleanup();
  
  const result = cleanup.performCleanup();
  
  if (result) {
    console.log(`\n🎉 Manual dependency cleanup completed successfully!`);
    console.log(`📦 ${result.removedCount} dependencies removed`);
    console.log(`\n🧪 Test your application:`);
    console.log('   npm run build');
    console.log('   npm run dev');
    console.log(`\n🔄 To restore if needed:`);
    console.log(`   node "${result.restoreScriptPath}"`);
  }
}

module.exports = ManualDependencyCleanup;
