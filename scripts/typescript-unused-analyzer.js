#!/usr/bin/env node

/**
 * TypeScript-aware unused file analyzer
 * Uses TypeScript compiler API for more accurate analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptUnusedAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      definitelyUnused: [],
      probablyUnused: [],
      needsReview: [],
      safe: []
    };
  }

  // Use TypeScript compiler to check for unused files
  async analyzeWithTSC() {
    console.log('🔍 Running TypeScript compiler analysis...');
    
    try {
      // Run tsc with noEmit to check for compilation errors
      const tscOutput = execSync('npx tsc --noEmit --listFiles', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      // Extract files that TypeScript actually processes
      const compiledFiles = new Set();
      const lines = tscOutput.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.includes('node_modules') && 
            (trimmed.endsWith('.ts') || trimmed.endsWith('.tsx'))) {
          const relativePath = path.relative(this.projectRoot, trimmed);
          compiledFiles.add(relativePath.replace(/\\/g, '/'));
        }
      }
      
      return compiledFiles;
    } catch (error) {
      console.warn('⚠️  TypeScript analysis failed:', error.message);
      return new Set();
    }
  }

  // Check Next.js specific usage patterns
  checkNextJSPatterns() {
    const nextJSFiles = new Set();
    
    // Check app directory structure (Next.js 13+ App Router)
    const appDir = path.join(this.projectRoot, 'src/app');
    if (fs.existsSync(appDir)) {
      this.scanNextJSAppDir(appDir, nextJSFiles);
    }
    
    // Check pages directory (Next.js Pages Router)
    const pagesDir = path.join(this.projectRoot, 'pages');
    if (fs.existsSync(pagesDir)) {
      this.scanNextJSPagesDir(pagesDir, nextJSFiles);
    }
    
    return nextJSFiles;
  }

  scanNextJSAppDir(dir, usedFiles, relativePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          this.scanNextJSAppDir(fullPath, usedFiles, relPath);
        } else if (entry.isFile()) {
          // Next.js App Router special files
          const specialFiles = [
            'page.tsx', 'page.ts', 'page.jsx', 'page.js',
            'layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
            'loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js',
            'error.tsx', 'error.ts', 'error.jsx', 'error.js',
            'not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js',
            'route.ts', 'route.js'
          ];
          
          if (specialFiles.includes(entry.name)) {
            const relativePath = path.relative(this.projectRoot, fullPath);
            usedFiles.add(relativePath.replace(/\\/g, '/'));
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan ${dir}:`, error.message);
    }
  }

  scanNextJSPagesDir(dir, usedFiles, relativePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          this.scanNextJSPagesDir(fullPath, usedFiles, relPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
            const relativePath = path.relative(this.projectRoot, fullPath);
            usedFiles.add(relativePath.replace(/\\/g, '/'));
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan ${dir}:`, error.message);
    }
  }

  // Check for dynamic imports and other runtime references
  checkDynamicReferences() {
    const dynamicRefs = new Set();
    
    // Scan for dynamic imports, require.resolve, etc.
    const scanPatterns = [
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /require\.resolve\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
    ];
    
    // This would need to scan all files - simplified for now
    return dynamicRefs;
  }

  // Get all TypeScript/JavaScript files
  getAllSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const scanDir = (dir, relativePath = '') => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(relativePath, entry.name);
          
          if (entry.isDirectory()) {
            if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(entry.name)) {
              scanDir(fullPath, relPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push({
                fullPath,
                relativePath: relPath.replace(/\\/g, '/'),
                name: entry.name,
                extension: ext
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan ${dir}:`, error.message);
      }
    };
    
    scanDir(this.projectRoot);
    return files;
  }

  // Main analysis
  async analyze() {
    console.log('🚀 Starting TypeScript-aware unused file analysis...');
    
    const allFiles = this.getAllSourceFiles();
    const allFilePaths = new Set(allFiles.map(f => f.relativePath));
    
    console.log(`📁 Found ${allFiles.length} source files`);
    
    // Get files that TypeScript compiler processes
    const compiledFiles = await this.analyzeWithTSC();
    console.log(`🔧 TypeScript processes ${compiledFiles.size} files`);
    
    // Get Next.js specific files
    const nextJSFiles = this.checkNextJSPatterns();
    console.log(`⚡ Found ${nextJSFiles.size} Next.js specific files`);
    
    // Combine all "used" files
    const usedFiles = new Set([...compiledFiles, ...nextJSFiles]);
    
    // Always keep certain files
    const alwaysKeep = [
      'src/app/globals.css',
      'src/styles/animations.css',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'jest.config.js',
      'jest.setup.js'
    ];
    
    // Categorize files
    for (const file of allFiles) {
      const filePath = file.relativePath;
      const isUsed = usedFiles.has(filePath);
      const isAlwaysKeep = alwaysKeep.some(keep => filePath.includes(keep));
      const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath);
      const isTypeFile = filePath.endsWith('.d.ts');
      
      if (isAlwaysKeep || isTestFile || isTypeFile) {
        this.results.safe.push({
          path: filePath,
          reason: isAlwaysKeep ? 'Configuration file' : 
                  isTestFile ? 'Test file' : 'Type definition'
        });
      } else if (!isUsed) {
        // Check if it's in a legacy or backup directory
        if (filePath.includes('legacy') || filePath.includes('backup') || 
            filePath.includes('old') || filePath.includes('unused')) {
          this.results.definitelyUnused.push(filePath);
        } else {
          this.results.probablyUnused.push(filePath);
        }
      } else {
        this.results.needsReview.push(filePath);
      }
    }
    
    return this.results;
  }

  // Generate comprehensive report
  generateReport() {
    return this.analyze().then(results => {
      console.log('\n' + '='.repeat(70));
      console.log('📊 TYPESCRIPT-AWARE UNUSED FILE ANALYSIS');
      console.log('='.repeat(70));
      
      console.log(`\n🗑️  Definitely unused (${results.definitelyUnused.length}):`);
      results.definitelyUnused.forEach(file => {
        console.log(`  ❌ ${file}`);
      });
      
      console.log(`\n⚠️  Probably unused (${results.probablyUnused.length}):`);
      results.probablyUnused.forEach(file => {
        console.log(`  🤔 ${file}`);
      });
      
      console.log(`\n✅ Safe to keep (${results.safe.length}):`);
      results.safe.slice(0, 5).forEach(file => {
        console.log(`  ✓ ${file.path} (${file.reason})`);
      });
      if (results.safe.length > 5) {
        console.log(`  ... and ${results.safe.length - 5} more safe files`);
      }
      
      // Save detailed report
      const reportPath = 'typescript-unused-analysis.json';
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      console.log(`\n📝 Detailed report saved to: ${reportPath}`);
      
      console.log('\n💡 Next steps:');
      console.log('1. Review "definitely unused" files first');
      console.log('2. Test your application thoroughly');
      console.log('3. Move suspicious files to a backup folder');
      console.log('4. Run tests and build to ensure nothing breaks');
      
      return results;
    });
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new TypeScriptUnusedAnalyzer();
  analyzer.generateReport().catch(console.error);
}

module.exports = TypeScriptUnusedAnalyzer;
