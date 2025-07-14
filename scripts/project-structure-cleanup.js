#!/usr/bin/env node

/**
 * Comprehensive Project Structure Cleanup
 * Organizes project by moving non-essential files to archive while keeping main app clean
 */

const fs = require('fs');
const path = require('path');

class ProjectStructureCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.archiveRoot = path.join(this.projectRoot, 'project_archive');
    this.sessionDir = path.join(this.archiveRoot, `cleanup_${this.timestamp}`);
    
    // Files and folders essential for the main Next.js app
    this.essentialItems = new Set([
      // Core Next.js files
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
      
      // Testing
      'jest.config.js',
      'jest.setup.js',
      
      // Code quality
      'knip.json',
      '.eslintrc.json',
      '.gitignore',
      '.env.local',
      '.env.example',
      
      // Database (Supabase is needed for deployment)
      'supabase',
      
      // Generated/Build files (keep but ignore in analysis)
      'node_modules',
      '.next',
      'tsconfig.tsbuildinfo',
      
      // Keep some essential scripts
      'scripts/maintenance-check.js',
      'scripts/pre-commit-check.js',
      
      // Keep current cleanup backups
      'reference_notused'
    ]);

    // Categories for organizing archived files
    this.archiveCategories = {
      documentation: {
        patterns: [/\.md$/, /\.txt$/],
        exceptions: ['README.md'],
        description: 'Documentation and analysis files'
      },
      python_scripts: {
        patterns: [/\.py$/],
        description: 'Python data processing scripts'
      },
      database_legacy: {
        folders: ['database'],
        description: 'Legacy database setup files (separate from supabase/)'
      },
      integration_packages: {
        folders: ['INTEGRATION_PACKAGE', 'BrowserTools-Extension-Fresh'],
        description: 'Integration packages and browser tools'
      },
      legacy_code: {
        folders: ['legacy ts'],
        description: 'Legacy TypeScript code'
      },
      analysis_data: {
        patterns: [/\.csv$/, /\.json$/, /\.geojson$/],
        exceptions: ['package.json', 'package-lock.json', 'components.json', 'knip.json'],
        description: 'Data files and analysis results'
      },
      svg_extracts: {
        folders: ['svg_extracts'],
        description: 'SVG extraction and analysis files'
      },
      docs_folder: {
        folders: ['docs'],
        description: 'Documentation folder'
      },
      temp_files: {
        patterns: [/^temp_/, /\.tmp$/, /\.temp$/],
        description: 'Temporary files'
      },
      scripts_archive: {
        description: 'Non-essential scripts (keeping some essential ones)'
      }
    };

    this.results = {
      timestamp: new Date().toISOString(),
      moved: [],
      kept: [],
      errors: []
    };
  }

  // Create archive directory structure
  createArchiveStructure() {
    if (!fs.existsSync(this.archiveRoot)) {
      fs.mkdirSync(this.archiveRoot, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    // Create category directories
    Object.keys(this.archiveCategories).forEach(category => {
      const categoryDir = path.join(this.sessionDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    });

    console.log(`📁 Created archive structure: ${this.sessionDir}`);
  }

  // Analyze project structure
  analyzeProjectStructure() {
    console.log('🔍 Analyzing project structure...');
    
    const items = fs.readdirSync(this.projectRoot, { withFileTypes: true });
    const analysis = {
      essential: [],
      nonEssential: [],
      total: items.length
    };

    for (const item of items) {
      const itemName = item.name;
      
      // Skip hidden files
      if (itemName.startsWith('.') && !this.essentialItems.has(itemName)) {
        continue;
      }

      if (this.essentialItems.has(itemName)) {
        analysis.essential.push({
          name: itemName,
          type: item.isDirectory() ? 'directory' : 'file',
          reason: 'Essential for main app'
        });
      } else {
        const category = this.categorizeItem(itemName, item.isDirectory());
        analysis.nonEssential.push({
          name: itemName,
          type: item.isDirectory() ? 'directory' : 'file',
          category: category,
          reason: this.archiveCategories[category]?.description || 'Non-essential'
        });
      }
    }

    return analysis;
  }

  // Categorize an item for archiving
  categorizeItem(itemName, isDirectory) {
    // Check folder-based categories first
    for (const [category, config] of Object.entries(this.archiveCategories)) {
      if (config.folders && config.folders.includes(itemName)) {
        return category;
      }
    }

    // Check pattern-based categories
    for (const [category, config] of Object.entries(this.archiveCategories)) {
      if (config.patterns) {
        const isException = config.exceptions && config.exceptions.includes(itemName);
        if (!isException && config.patterns.some(pattern => pattern.test(itemName))) {
          return category;
        }
      }
    }

    // Special handling for scripts
    if (itemName === 'scripts') {
      return 'scripts_archive';
    }

    // Default category
    return 'miscellaneous';
  }

  // Move item to archive
  moveToArchive(itemName, category) {
    const sourcePath = path.join(this.projectRoot, itemName);
    const targetDir = path.join(this.sessionDir, category);
    const targetPath = path.join(targetDir, itemName);

    try {
      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Move the item
      fs.renameSync(sourcePath, targetPath);
      
      this.results.moved.push({
        item: itemName,
        category: category,
        from: sourcePath,
        to: targetPath
      });

      return true;
    } catch (error) {
      this.results.errors.push({
        item: itemName,
        error: error.message
      });
      return false;
    }
  }

  // Handle scripts folder specially (keep some, archive others)
  handleScriptsFolder() {
    const scriptsPath = path.join(this.projectRoot, 'scripts');
    if (!fs.existsSync(scriptsPath)) {
      return;
    }

    const scriptsToKeep = [
      'maintenance-check.js',
      'pre-commit-check.js'
    ];

    const scriptsArchiveDir = path.join(this.sessionDir, 'scripts_archive');
    if (!fs.existsSync(scriptsArchiveDir)) {
      fs.mkdirSync(scriptsArchiveDir, { recursive: true });
    }

    const scriptFiles = fs.readdirSync(scriptsPath);
    
    for (const scriptFile of scriptFiles) {
      if (!scriptsToKeep.includes(scriptFile)) {
        const sourcePath = path.join(scriptsPath, scriptFile);
        const targetPath = path.join(scriptsArchiveDir, scriptFile);
        
        try {
          fs.renameSync(sourcePath, targetPath);
          this.results.moved.push({
            item: `scripts/${scriptFile}`,
            category: 'scripts_archive',
            from: sourcePath,
            to: targetPath
          });
        } catch (error) {
          this.results.errors.push({
            item: `scripts/${scriptFile}`,
            error: error.message
          });
        }
      }
    }
  }

  // Generate cleanup report
  generateReport() {
    const reportPath = path.join(this.sessionDir, 'cleanup-report.json');
    const report = {
      ...this.results,
      summary: {
        totalMoved: this.results.moved.length,
        totalKept: this.results.kept.length,
        totalErrors: this.results.errors.length,
        archiveLocation: this.sessionDir
      },
      categories: {}
    };

    // Group moved items by category
    this.results.moved.forEach(item => {
      if (!report.categories[item.category]) {
        report.categories[item.category] = [];
      }
      report.categories[item.category].push(item.item);
    });

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    return report;
  }

  // Create restoration script
  createRestorationScript() {
    const restoreScriptPath = path.join(this.sessionDir, 'restore-project-structure.js');
    const restoreScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = '${this.projectRoot}';
const archiveDir = '${this.sessionDir}';

console.log('🔄 Restoring project structure from archive...');

const movedItems = ${JSON.stringify(this.results.moved, null, 2)};

for (const item of movedItems) {
  try {
    const sourcePath = item.to;
    const targetPath = item.from;
    
    if (fs.existsSync(sourcePath)) {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.renameSync(sourcePath, targetPath);
      console.log(\`✅ Restored: \${item.item}\`);
    } else {
      console.log(\`⚠️  Not found: \${item.item}\`);
    }
  } catch (error) {
    console.error(\`❌ Failed to restore \${item.item}:\`, error.message);
  }
}

console.log('🎉 Project structure restoration complete!');
`;

    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, '755');
    
    return restoreScriptPath;
  }

  // Main cleanup process
  performCleanup() {
    console.log('🚀 Starting project structure cleanup...');
    
    this.createArchiveStructure();
    const analysis = this.analyzeProjectStructure();
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`  Essential items: ${analysis.essential.length}`);
    console.log(`  Non-essential items: ${analysis.nonEssential.length}`);
    console.log(`  Total items: ${analysis.total}`);

    // Move non-essential items
    console.log('\n📦 Moving non-essential items to archive...');
    
    for (const item of analysis.nonEssential) {
      if (item.name === 'scripts') {
        this.handleScriptsFolder();
      } else {
        const success = this.moveToArchive(item.name, item.category);
        if (success) {
          console.log(`  ✅ Moved: ${item.name} → ${item.category}`);
        } else {
          console.log(`  ❌ Failed: ${item.name}`);
        }
      }
    }

    // Record kept items
    this.results.kept = analysis.essential;

    const report = this.generateReport();
    const restoreScript = this.createRestorationScript();

    console.log(`\n🎉 Project structure cleanup complete!`);
    console.log(`📦 Moved ${report.summary.totalMoved} items to archive`);
    console.log(`✅ Kept ${report.summary.totalKept} essential items`);
    console.log(`📁 Archive location: ${this.sessionDir}`);
    console.log(`🔄 Restore script: ${restoreScript}`);

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const cleanup = new ProjectStructureCleanup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--dry-run')) {
    console.log('🔍 DRY RUN - No files will be moved');
    const analysis = cleanup.analyzeProjectStructure();
    
    console.log('\n📋 Items that would be moved:');
    analysis.nonEssential.forEach(item => {
      console.log(`  ${item.name} (${item.type}) → ${item.category}`);
    });
    
    console.log('\n📋 Items that would be kept:');
    analysis.essential.forEach(item => {
      console.log(`  ${item.name} (${item.type}) - ${item.reason}`);
    });
  } else {
    cleanup.performCleanup();
  }
}

module.exports = ProjectStructureCleanup;
