#!/usr/bin/env node

/**
 * Analyze unused types in the src/types directory
 * This script finds which types, interfaces, and exports are actually being used
 */

const fs = require('fs');
const path = require('path');

class TypeUsageAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.typesDir = path.join(this.projectRoot, 'src', 'types');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.usedTypes = new Set();
    this.definedTypes = new Map(); // file -> types
    this.unusedTypes = [];
  }

  // Get all TypeScript files in src directory (excluding types directory)
  getAllSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .next, etc.
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'types') {
            scanDir(fullPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(this.srcDir);
    return files;
  }

  // Get all type files
  getTypeFiles() {
    const files = [];
    if (!fs.existsSync(this.typesDir)) return files;
    
    const items = fs.readdirSync(this.typesDir);
    for (const item of items) {
      if (item.endsWith('.ts') && item !== 'supabase.ts') {
        files.push(path.join(this.typesDir, item));
      }
    }
    return files;
  }

  // Extract type definitions from a file
  extractTypeDefinitions(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const types = new Set();
      
      // Patterns to match type definitions
      const patterns = [
        /export\s+(?:type|interface)\s+(\w+)/g,
        /export\s+(?:const|let|var)\s+(\w+)/g,
        /export\s+(?:class|enum)\s+(\w+)/g,
        /export\s+(?:function)\s+(\w+)/g,
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          types.add(match[1]);
        }
      }
      
      return types;
    } catch (error) {
      console.warn(`Error reading ${filePath}:`, error.message);
      return new Set();
    }
  }

  // Find type imports and usage in a file
  findTypeUsage(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const usedTypes = new Set();
      
      // Find imports from types directory
      const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"`]@?\/types\/(\w+)['"`]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) {
          // Named imports: { Type1, Type2 }
          const namedImports = match[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/, ''));
          namedImports.forEach(imp => usedTypes.add(imp));
        } else if (match[2]) {
          // Namespace import: * as Types
          usedTypes.add(match[2]);
        } else if (match[3]) {
          // Default import
          usedTypes.add(match[3]);
        }
      }
      
      // Also check for direct type usage (for cases where types are re-exported)
      const typeUsageRegex = /\b([A-Z]\w*(?:Type|Interface|Data|Config|Result|Error|Status|Category|Phase)?)\b/g;
      while ((match = typeUsageRegex.exec(content)) !== null) {
        usedTypes.add(match[1]);
      }
      
      return usedTypes;
    } catch (error) {
      console.warn(`Error reading ${filePath}:`, error.message);
      return new Set();
    }
  }

  // Main analysis
  async analyze() {
    console.log('🔍 Analyzing type usage...');
    
    // Get all type definitions
    const typeFiles = this.getTypeFiles();
    console.log(`📁 Found ${typeFiles.length} type files`);
    
    for (const typeFile of typeFiles) {
      const fileName = path.basename(typeFile, '.ts');
      const types = this.extractTypeDefinitions(typeFile);
      this.definedTypes.set(fileName, types);
      console.log(`📄 ${fileName}.ts: ${types.size} types defined`);
    }
    
    // Find usage in source files
    const sourceFiles = this.getAllSourceFiles();
    console.log(`🔍 Scanning ${sourceFiles.length} source files for type usage...`);
    
    for (const sourceFile of sourceFiles) {
      const usedTypes = this.findTypeUsage(sourceFile);
      usedTypes.forEach(type => this.usedTypes.add(type));
    }
    
    console.log(`✅ Found ${this.usedTypes.size} used types`);
    
    // Find unused types
    for (const [fileName, types] of this.definedTypes) {
      const unusedInFile = [];
      for (const type of types) {
        if (!this.usedTypes.has(type)) {
          unusedInFile.push(type);
        }
      }
      if (unusedInFile.length > 0) {
        this.unusedTypes.push({
          file: fileName,
          unused: unusedInFile,
          total: types.size
        });
      }
    }
    
    return this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 TYPE USAGE ANALYSIS REPORT');
    console.log('='.repeat(70));
    
    let totalUnused = 0;
    let totalDefined = 0;
    
    for (const [fileName, types] of this.definedTypes) {
      totalDefined += types.size;
    }
    
    if (this.unusedTypes.length === 0) {
      console.log('\n✅ All types are being used!');
    } else {
      console.log(`\n🗑️  UNUSED TYPES (${this.unusedTypes.length} files with unused types):`);
      
      for (const fileInfo of this.unusedTypes) {
        totalUnused += fileInfo.unused.length;
        console.log(`\n📄 ${fileInfo.file}.ts (${fileInfo.unused.length}/${fileInfo.total} unused):`);
        fileInfo.unused.forEach(type => {
          console.log(`  ❌ ${type}`);
        });
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total types defined: ${totalDefined}`);
    console.log(`  Total types used: ${this.usedTypes.size}`);
    console.log(`  Total types unused: ${totalUnused}`);
    console.log(`  Usage rate: ${((this.usedTypes.size / totalDefined) * 100).toFixed(1)}%`);
    
    // Save detailed report
    const report = {
      summary: {
        totalDefined,
        totalUsed: this.usedTypes.size,
        totalUnused,
        usageRate: ((this.usedTypes.size / totalDefined) * 100).toFixed(1)
      },
      unusedTypes: this.unusedTypes,
      usedTypes: Array.from(this.usedTypes).sort(),
      definedTypes: Object.fromEntries(
        Array.from(this.definedTypes.entries()).map(([file, types]) => [
          file,
          Array.from(types).sort()
        ])
      )
    };
    
    const reportPath = path.join(this.projectRoot, 'TEMP DEV FOLDER', 'type-usage-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new TypeUsageAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = TypeUsageAnalyzer;
