#!/usr/bin/env node

/**
 * Safe dependency cleanup based on Knip analysis
 * Removes unused dependencies and devDependencies from package.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'reference_notused');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.sessionDir = path.join(this.backupDir, `dependency_cleanup_${this.timestamp}`);
  }

  // Run Knip and get dependency analysis
  async getKnipDependencyAnalysis() {
    console.log('🔍 Running Knip dependency analysis...');
    
    try {
      const output = execSync('npx knip --reporter json', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      return JSON.parse(output);
    } catch (error) {
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

  // Create backup of package.json
  createPackageBackup() {
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

  // Extract unused dependencies from Knip results
  extractUnusedDependencies(knipResults) {
    const unusedDeps = {
      dependencies: [],
      devDependencies: []
    };

    // Parse Knip issues format
    if (knipResults.issues) {
      for (const issue of knipResults.issues) {
        if (issue.file === 'package.json') {
          if (issue.dependencies) {
            unusedDeps.dependencies = issue.dependencies.map(dep => dep.name);
          }
          if (issue.devDependencies) {
            unusedDeps.devDependencies = issue.devDependencies.map(dep => dep.name);
          }
        }
      }
    }

    return unusedDeps;
  }

  // Remove dependencies from package.json
  removeDependencies(unusedDeps) {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const removedDeps = [];

    console.log('\n📦 Removing unused dependencies...');

    // Remove regular dependencies
    if (unusedDeps.dependencies.length > 0) {
      console.log(`\n🗑️  Removing ${unusedDeps.dependencies.length} unused dependencies:`);
      for (const depName of unusedDeps.dependencies) {
        if (packageJson.dependencies && packageJson.dependencies[depName]) {
          console.log(`  - ${depName}`);
          delete packageJson.dependencies[depName];
          removedDeps.push({ name: depName, type: 'dependency' });
        }
      }
    }

    // Remove devDependencies
    if (unusedDeps.devDependencies.length > 0) {
      console.log(`\n🗑️  Removing ${unusedDeps.devDependencies.length} unused devDependencies:`);
      for (const depName of unusedDeps.devDependencies) {
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
  saveManifest(removedDeps, knipResults) {
    const manifestPath = path.join(this.sessionDir, 'dependency-cleanup-manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      description: 'Dependency cleanup based on Knip analysis',
      removedDependencies: removedDeps,
      totalRemoved: removedDeps.length,
      knipResults: knipResults
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📝 Saved cleanup manifest: ${manifestPath}`);
    
    return manifestPath;
  }

  // Main cleanup process
  async performCleanup() {
    console.log('🚀 Starting dependency cleanup...');
    
    const knipResults = await this.getKnipDependencyAnalysis();
    if (!knipResults) {
      console.error('❌ Cannot proceed without Knip analysis');
      return null;
    }

    const backupPath = this.createPackageBackup();
    const unusedDeps = this.extractUnusedDependencies(knipResults);
    
    console.log(`\n📊 Found unused dependencies:`);
    console.log(`  - Dependencies: ${unusedDeps.dependencies.length}`);
    console.log(`  - DevDependencies: ${unusedDeps.devDependencies.length}`);

    if (unusedDeps.dependencies.length === 0 && unusedDeps.devDependencies.length === 0) {
      console.log('✅ No unused dependencies found!');
      return null;
    }

    const removedDeps = this.removeDependencies(unusedDeps);
    const lockFileUpdated = this.updateLockFile();
    
    if (!lockFileUpdated) {
      console.error('❌ Failed to update lock file - consider restoring from backup');
      return null;
    }

    const restoreScriptPath = this.createRestorationScript(backupPath, removedDeps);
    const manifestPath = this.saveManifest(removedDeps, knipResults);

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
  async testApplication() {
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
  const cleanup = new DependencyCleanup();
  
  cleanup.performCleanup()
    .then(result => {
      if (result) {
        console.log(`\n🎉 Dependency cleanup completed successfully!`);
        console.log(`📦 ${result.removedCount} dependencies removed`);
        console.log(`\n🧪 Test your application:`);
        console.log('   npm run build');
        console.log('   npm run dev');
      }
    })
    .catch(console.error);
}

module.exports = DependencyCleanup;
