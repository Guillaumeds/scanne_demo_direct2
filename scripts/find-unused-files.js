#!/usr/bin/env node

/**
 * Script to find potentially unused files in the codebase
 * This uses static analysis to identify files that aren't imported anywhere
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Directories to scan for source files
  sourceDirs: ['src', 'components', 'pages', 'lib', 'utils', 'hooks', 'contexts', 'services', 'types', 'schemas'],
  
  // File extensions to consider
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Directories to ignore
  ignoreDirs: ['node_modules', '.next', 'dist', 'build', '.git', 'public'],
  
  // Files to always keep (entry points, configs, etc.)
  alwaysKeep: [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/globals.css',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'package.json',
    'jest.config.js',
    'jest.setup.js'
  ],
  
  // Patterns that indicate a file might be used even if not directly imported
  specialPatterns: [
    /page\.tsx?$/,           // Next.js pages
    /layout\.tsx?$/,         // Next.js layouts
    /loading\.tsx?$/,        // Next.js loading components
    /error\.tsx?$/,          // Next.js error components
    /not-found\.tsx?$/,      // Next.js not-found components
    /globals\.css$/,         // Global CSS
    /\.test\.(ts|tsx|js|jsx)$/, // Test files
    /\.spec\.(ts|tsx|js|jsx)$/, // Spec files
    /\.d\.ts$/,              // Type definition files
  ]
};

class UnusedFileFinder {
  constructor() {
    this.allFiles = new Set();
    this.importedFiles = new Set();
    this.results = {
      unused: [],
      suspicious: [],
      safe: []
    };
  }

  // Get all source files in the project
  getAllFiles(dir = '.', relativePath = '') {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          if (!CONFIG.ignoreDirs.includes(entry.name)) {
            files.push(...this.getAllFiles(fullPath, relPath));
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (CONFIG.extensions.includes(ext)) {
            files.push({
              fullPath,
              relativePath: relPath,
              name: entry.name,
              extension: ext
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error.message);
    }
    
    return files;
  }

  // Extract imports from a file
  extractImports(filePath) {
    const imports = new Set();
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Match various import patterns
      const importPatterns = [
        // ES6 imports: import ... from '...'
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g,
        // Dynamic imports: import('...')
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        // Require: require('...')
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        // Next.js dynamic: dynamic(() => import('...'))
        /dynamic\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
      ];
      
      for (const pattern of importPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          
          // Skip external packages (don't start with . or /)
          if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
            continue;
          }
          
          imports.add(importPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    }
    
    return imports;
  }

  // Resolve import path to actual file
  resolveImportPath(importPath, fromFile) {
    const fromDir = path.dirname(fromFile);
    
    // Handle @/ alias (assuming it points to src/)
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', 'src/');
    }
    
    // Resolve relative path
    let resolvedPath = path.resolve(fromDir, importPath);
    
    // Try different extensions if no extension provided
    if (!path.extname(resolvedPath)) {
      for (const ext of CONFIG.extensions) {
        const withExt = resolvedPath + ext;
        if (fs.existsSync(withExt)) {
          return path.relative('.', withExt);
        }
      }
      
      // Try index files
      for (const ext of CONFIG.extensions) {
        const indexFile = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return path.relative('.', indexFile);
        }
      }
    } else {
      if (fs.existsSync(resolvedPath)) {
        return path.relative('.', resolvedPath);
      }
    }
    
    return null;
  }

  // Check if file matches special patterns
  isSpecialFile(filePath) {
    return CONFIG.specialPatterns.some(pattern => pattern.test(filePath));
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Scanning for all source files...');
    const allFiles = this.getAllFiles();
    
    console.log(`📁 Found ${allFiles.length} source files`);
    
    // Build set of all files
    for (const file of allFiles) {
      this.allFiles.add(file.relativePath.replace(/\\/g, '/'));
    }
    
    console.log('🔗 Analyzing imports...');
    
    // Find all imported files
    for (const file of allFiles) {
      const imports = this.extractImports(file.fullPath);
      
      for (const importPath of imports) {
        const resolvedPath = this.resolveImportPath(importPath, file.fullPath);
        if (resolvedPath) {
          this.importedFiles.add(resolvedPath.replace(/\\/g, '/'));
        }
      }
    }
    
    console.log(`📦 Found ${this.importedFiles.size} imported files`);
    
    // Categorize files
    for (const filePath of this.allFiles) {
      const isImported = this.importedFiles.has(filePath);
      const isAlwaysKeep = CONFIG.alwaysKeep.some(keep => filePath.includes(keep.replace(/\\/g, '/')));
      const isSpecial = this.isSpecialFile(filePath);
      
      if (isAlwaysKeep || isSpecial) {
        this.results.safe.push({
          path: filePath,
          reason: isAlwaysKeep ? 'Always keep' : 'Special file pattern'
        });
      } else if (!isImported) {
        this.results.unused.push(filePath);
      } else {
        this.results.suspicious.push(filePath);
      }
    }
    
    return this.results;
  }

  // Generate report
  generateReport() {
    const results = this.analyze();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 UNUSED FILE ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Safe files (${results.safe.length}):`);
    results.safe.forEach(file => {
      console.log(`  📄 ${file.path} (${file.reason})`);
    });
    
    console.log(`\n⚠️  Potentially unused files (${results.unused.length}):`);
    results.unused.forEach(file => {
      console.log(`  🗑️  ${file}`);
    });
    
    console.log(`\n🔍 Files that need manual review (${results.suspicious.length}):`);
    results.suspicious.slice(0, 10).forEach(file => {
      console.log(`  ❓ ${file}`);
    });
    
    if (results.suspicious.length > 10) {
      console.log(`  ... and ${results.suspicious.length - 10} more`);
    }
    
    // Save detailed report to file
    const reportPath = 'unused-files-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);
    
    return results;
  }
}

// Run the analysis
if (require.main === module) {
  const finder = new UnusedFileFinder();
  finder.generateReport();
}

module.exports = UnusedFileFinder;
