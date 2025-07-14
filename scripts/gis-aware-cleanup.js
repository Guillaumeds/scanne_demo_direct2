#!/usr/bin/env node

/**
 * GIS-Aware Project Structure Cleanup
 * Safely removes non-essential files while preserving all GIS/mapping assets
 * Uses proven tools: trash-cli for safe deletion
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GISAwareCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    
    // Files and folders that are ESSENTIAL for the main app
    this.essentialItems = new Set([
      // Core Next.js application
      'src',
      'public',
      'package.json',
      'package-lock.json',
      'next.config.js',
      'next-env.d.ts',
      'tsconfig.json',
      'tailwind.config.js',
      'postcss.config.js',
      'components.json',
      
      // Testing & Quality
      'jest.config.js',
      'jest.setup.js',
      'knip.json',
      '.eslintrc.json',
      
      // Environment & Git
      '.gitignore',
      '.env.local',
      '.env.example',
      
      // Database (Supabase needed for deployment)
      'supabase',
      
      // Generated/Build (ignore but don't delete)
      'node_modules',
      '.next',
      'tsconfig.tsbuildinfo',
      
      // Keep cleanup backups
      'reference_notused',
      
      // Keep essential maintenance scripts
      'scripts'
    ]);

    // GIS and mapping assets that MUST be preserved
    this.gisAssets = [
      'public/msiri_soil_map/',
      'public/sentinel_overlays/',
      'public/estate_fields.csv',
      'public/estate_fields.geojson',
      'public/leaflet.snap.js',
      'public/logo-omnicane.png',
      'public/scanne-logo.png',
      'public/images/varieties/',
      'public/images/intercrops/',
      'public/sugarcane_varieties_leaflets/'
    ];

    this.results = {
      timestamp: new Date().toISOString(),
      preserved: [],
      removed: [],
      errors: []
    };
  }

  // Check if trash-cli is available
  checkTrashCli() {
    try {
      execSync('npx trash --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.log('📦 Installing trash-cli for safe deletion...');
      try {
        execSync('npm install -g trash-cli', { stdio: 'inherit' });
        return true;
      } catch (installError) {
        console.error('❌ Failed to install trash-cli:', installError.message);
        return false;
      }
    }
  }

  // Analyze current project structure
  analyzeProject() {
    console.log('🔍 Analyzing project structure with GIS awareness...');
    
    const items = fs.readdirSync(this.projectRoot, { withFileTypes: true });
    const analysis = {
      essential: [],
      removable: [],
      gisProtected: []
    };

    for (const item of items) {
      const itemName = item.name;
      const itemPath = path.join(this.projectRoot, itemName);
      
      // Skip hidden files (except essential ones)
      if (itemName.startsWith('.') && !this.essentialItems.has(itemName)) {
        continue;
      }

      if (this.essentialItems.has(itemName)) {
        analysis.essential.push({
          name: itemName,
          type: item.isDirectory() ? 'directory' : 'file',
          reason: 'Essential for main app'
        });
      } else if (this.isGISProtected(itemPath)) {
        analysis.gisProtected.push({
          name: itemName,
          type: item.isDirectory() ? 'directory' : 'file',
          reason: 'GIS/mapping asset'
        });
      } else {
        analysis.removable.push({
          name: itemName,
          type: item.isDirectory() ? 'directory' : 'file',
          category: this.categorizeForRemoval(itemName, item.isDirectory())
        });
      }
    }

    return analysis;
  }

  // Check if item is protected GIS asset
  isGISProtected(itemPath) {
    const relativePath = path.relative(this.projectRoot, itemPath);
    return this.gisAssets.some(asset => 
      relativePath.startsWith(asset) || asset.startsWith(relativePath)
    );
  }

  // Categorize item for removal
  categorizeForRemoval(itemName, isDirectory) {
    // Documentation files
    if (/\.(md|txt)$/i.test(itemName) && itemName !== 'README.md') {
      return 'documentation';
    }
    
    // Python scripts
    if (/\.py$/i.test(itemName)) {
      return 'python_scripts';
    }
    
    // Data analysis files
    if (/\.(csv|json|geojson)$/i.test(itemName)) {
      const protectedFiles = ['package.json', 'package-lock.json', 'components.json', 'knip.json'];
      if (!protectedFiles.includes(itemName)) {
        return 'data_files';
      }
    }
    
    // Known legacy folders
    const legacyFolders = ['database', 'docs', 'INTEGRATION_PACKAGE', 'svg_extracts', 'legacy ts', 'BrowserTools-Extension-Fresh'];
    if (isDirectory && legacyFolders.includes(itemName)) {
      return 'legacy_folders';
    }
    
    // Temporary files
    if (/^temp_|\.tmp$|\.temp$/i.test(itemName)) {
      return 'temp_files';
    }
    
    return 'miscellaneous';
  }

  // Safely remove items using trash-cli
  safeRemove(items) {
    if (items.length === 0) {
      console.log('✅ No items to remove');
      return;
    }

    console.log(`\n🗑️  Safely removing ${items.length} items to trash...`);
    
    for (const item of items) {
      try {
        const itemPath = path.join(this.projectRoot, item.name);
        
        // Double-check it's not a GIS asset
        if (this.isGISProtected(itemPath)) {
          console.log(`🛡️  PROTECTED: ${item.name} (GIS asset)`);
          this.results.preserved.push({
            item: item.name,
            reason: 'GIS asset protection'
          });
          continue;
        }

        // Use trash-cli for safe removal
        execSync(`npx trash "${itemPath}"`, { stdio: 'pipe' });
        
        console.log(`  ✅ Moved to trash: ${item.name} (${item.category})`);
        this.results.removed.push({
          item: item.name,
          category: item.category,
          type: item.type
        });
        
      } catch (error) {
        console.log(`  ❌ Failed: ${item.name} - ${error.message}`);
        this.results.errors.push({
          item: item.name,
          error: error.message
        });
      }
    }
  }

  // Generate cleanup report
  generateReport() {
    const reportPath = path.join(this.projectRoot, `gis-cleanup-report-${this.timestamp}.json`);
    const report = {
      ...this.results,
      summary: {
        totalRemoved: this.results.removed.length,
        totalPreserved: this.results.preserved.length,
        totalErrors: this.results.errors.length,
        gisAssetsProtected: this.gisAssets.length
      },
      gisAssetsProtected: this.gisAssets,
      restorationNote: 'Items moved to system trash - can be restored from there'
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    return report;
  }

  // Main cleanup process
  performCleanup(dryRun = false) {
    console.log('🚀 Starting GIS-aware project cleanup...');
    
    if (!dryRun && !this.checkTrashCli()) {
      console.error('❌ Cannot proceed without trash-cli for safe deletion');
      return null;
    }

    const analysis = this.analyzeProject();
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`  Essential items: ${analysis.essential.length}`);
    console.log(`  GIS protected items: ${analysis.gisProtected.length}`);
    console.log(`  Removable items: ${analysis.removable.length}`);

    // Show what would be removed
    console.log(`\n📋 Items that would be ${dryRun ? 'removed' : 'moved to trash'}:`);
    analysis.removable.forEach(item => {
      console.log(`  ${item.name} (${item.type}) → ${item.category}`);
    });

    console.log(`\n🛡️  GIS assets that will be PRESERVED:`);
    this.gisAssets.forEach(asset => {
      if (fs.existsSync(path.join(this.projectRoot, asset))) {
        console.log(`  ✅ ${asset}`);
      }
    });

    if (dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No files were moved');
      return analysis;
    }

    // Perform actual cleanup
    this.safeRemove(analysis.removable);
    
    const report = this.generateReport();
    
    console.log(`\n🎉 GIS-aware cleanup complete!`);
    console.log(`🗑️  Moved ${report.summary.totalRemoved} items to trash`);
    console.log(`🛡️  Protected ${this.gisAssets.length} GIS assets`);
    console.log(`📝 Report saved: gis-cleanup-report-${this.timestamp}.json`);
    console.log(`\n💡 Items are in system trash and can be restored if needed`);

    return report;
  }

  // Test that app still works after cleanup
  testApplication() {
    console.log('\n🧪 Testing application after cleanup...');
    
    try {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      
      console.log('📝 Running TypeScript check...');
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      
      console.log('🏗️  Testing build...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('✅ All tests passed - application is working correctly');
      return true;
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      console.log('\n💡 You may need to restore some files from trash');
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new GISAwareCleanup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--dry-run')) {
    cleanup.performCleanup(true);
  } else if (args.includes('--test')) {
    cleanup.testApplication();
  } else {
    const result = cleanup.performCleanup(false);
    
    if (result && args.includes('--with-test')) {
      cleanup.testApplication();
    }
  }
}

module.exports = GISAwareCleanup;
