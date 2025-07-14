#!/usr/bin/env node

/**
 * Legacy vs Modern Component Analyzer
 * Finds all components that have both Modern and Legacy versions
 * and analyzes which ones are actually being used
 */

const fs = require('fs');
const path = require('path');

class LegacyModernAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.components = new Map();
    this.imports = new Map();
    this.results = {
      duplicates: [],
      modernOnly: [],
      legacyOnly: [],
      usage: new Map()
    };
  }

  // Find all component files
  findComponents(dir = 'src/components') {
    const fullDir = path.join(this.projectRoot, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(fullDir, file.name);
      const relativePath = path.relative(this.projectRoot, fullPath);
      
      if (file.isDirectory()) {
        this.findComponents(relativePath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        this.analyzeComponent(relativePath, file.name);
      }
    }
  }

  // Analyze individual component
  analyzeComponent(filePath, fileName) {
    const baseName = fileName.replace(/\.(tsx?|jsx?)$/, '');
    const isModern = baseName.startsWith('Modern');
    const coreComponentName = isModern ? baseName.replace(/^Modern/, '') : baseName;
    
    if (!this.components.has(coreComponentName)) {
      this.components.set(coreComponentName, {
        name: coreComponentName,
        modern: null,
        legacy: null,
        modernUsage: [],
        legacyUsage: []
      });
    }
    
    const component = this.components.get(coreComponentName);
    
    if (isModern) {
      component.modern = {
        path: filePath,
        fileName: fileName,
        fullName: baseName
      };
    } else {
      component.legacy = {
        path: filePath,
        fileName: fileName,
        fullName: baseName
      };
    }
  }

  // Find all imports across the codebase
  findImports() {
    this.scanForImports('src');
  }

  scanForImports(dir) {
    const fullDir = path.join(this.projectRoot, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(fullDir, file.name);
      const relativePath = path.relative(this.projectRoot, fullPath);
      
      if (file.isDirectory()) {
        this.scanForImports(relativePath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        this.analyzeImports(relativePath);
      }
    }
  }

  analyzeImports(filePath) {
    try {
      const content = fs.readFileSync(path.join(this.projectRoot, filePath), 'utf8');
      const importLines = content.split('\n').filter(line => 
        line.trim().startsWith('import') && 
        (line.includes('@/components') || line.includes('./') || line.includes('../'))
      );

      for (const line of importLines) {
        // Extract component names from import statements
        const matches = line.match(/import\s+(?:{[^}]+}|\w+|[^}]+)\s+from\s+['"]([^'"]+)['"]/);
        if (matches) {
          const importPath = matches[1];
          const importedNames = this.extractImportedNames(line);
          
          for (const name of importedNames) {
            if (!this.imports.has(name)) {
              this.imports.set(name, []);
            }
            this.imports.get(name).push({
              usedIn: filePath,
              importPath: importPath,
              line: line.trim()
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Could not read file ${filePath}:`, error.message);
    }
  }

  extractImportedNames(importLine) {
    const names = [];
    
    // Handle default imports: import ComponentName from '...'
    const defaultMatch = importLine.match(/import\s+(\w+)\s+from/);
    if (defaultMatch) {
      names.push(defaultMatch[1]);
    }
    
    // Handle named imports: import { Name1, Name2 } from '...'
    const namedMatch = importLine.match(/import\s+{([^}]+)}\s+from/);
    if (namedMatch) {
      const namedImports = namedMatch[1].split(',').map(name => 
        name.trim().split(' as ')[0].trim()
      );
      names.push(...namedImports);
    }
    
    return names;
  }

  // Analyze usage patterns
  analyzeUsage() {
    for (const [componentName, component] of this.components) {
      if (component.modern) {
        const modernUsage = this.imports.get(component.modern.fullName) || [];
        component.modernUsage = modernUsage;
      }
      
      if (component.legacy) {
        const legacyUsage = this.imports.get(component.legacy.fullName) || [];
        component.legacyUsage = legacyUsage;
      }
      
      // Categorize components
      if (component.modern && component.legacy) {
        this.results.duplicates.push(component);
      } else if (component.modern) {
        this.results.modernOnly.push(component);
      } else if (component.legacy) {
        this.results.legacyOnly.push(component);
      }
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('🔍 LEGACY vs MODERN COMPONENT ANALYSIS\n');
    console.log('=' .repeat(60));
    
    // Duplicates (both Modern and Legacy versions exist)
    console.log('\n🔄 DUPLICATE COMPONENTS (Modern + Legacy):');
    console.log('-'.repeat(50));
    
    if (this.results.duplicates.length === 0) {
      console.log('✅ No duplicate components found!');
    } else {
      for (const comp of this.results.duplicates) {
        console.log(`\n📦 ${comp.name}:`);
        console.log(`   Legacy:  ${comp.legacy.path} (${comp.legacyUsage.length} usages)`);
        console.log(`   Modern:  ${comp.modern.path} (${comp.modernUsage.length} usages)`);
        
        if (comp.legacyUsage.length > 0) {
          console.log(`   Legacy used in:`);
          comp.legacyUsage.forEach(usage => {
            console.log(`     - ${usage.usedIn}`);
          });
        }
        
        if (comp.modernUsage.length > 0) {
          console.log(`   Modern used in:`);
          comp.modernUsage.forEach(usage => {
            console.log(`     - ${usage.usedIn}`);
          });
        }
        
        // Recommendation
        if (comp.modernUsage.length > 0 && comp.legacyUsage.length === 0) {
          console.log(`   ✅ RECOMMENDATION: Remove legacy version (${comp.legacy.path})`);
        } else if (comp.legacyUsage.length > 0 && comp.modernUsage.length === 0) {
          console.log(`   ⚠️  RECOMMENDATION: Remove modern version (${comp.modern.path}) or migrate usage`);
        } else if (comp.legacyUsage.length > 0 && comp.modernUsage.length > 0) {
          console.log(`   🔄 RECOMMENDATION: Migrate legacy usage to modern, then remove legacy`);
        } else {
          console.log(`   🗑️  RECOMMENDATION: Both versions unused - remove both`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('-'.repeat(30));
    console.log(`Total components analyzed: ${this.components.size}`);
    console.log(`Duplicate components: ${this.results.duplicates.length}`);
    console.log(`Modern-only components: ${this.results.modernOnly.length}`);
    console.log(`Legacy-only components: ${this.results.legacyOnly.length}`);
    
    return this.results;
  }

  // Generate JSON report for further analysis
  saveJsonReport(outputPath = 'TEMP DEV FOLDER/legacy-modern-analysis.json') {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.components.size,
        duplicates: this.results.duplicates.length,
        modernOnly: this.results.modernOnly.length,
        legacyOnly: this.results.legacyOnly.length
      },
      duplicates: this.results.duplicates.map(comp => ({
        name: comp.name,
        legacy: comp.legacy,
        modern: comp.modern,
        legacyUsageCount: comp.legacyUsage.length,
        modernUsageCount: comp.modernUsage.length,
        legacyUsedIn: comp.legacyUsage.map(u => u.usedIn),
        modernUsedIn: comp.modernUsage.map(u => u.usedIn),
        recommendation: this.getRecommendation(comp)
      })),
      allComponents: Array.from(this.components.values())
    };
    
    const fullPath = path.join(this.projectRoot, outputPath);
    fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${outputPath}`);
  }

  getRecommendation(comp) {
    if (comp.modernUsage.length > 0 && comp.legacyUsage.length === 0) {
      return 'REMOVE_LEGACY';
    } else if (comp.legacyUsage.length > 0 && comp.modernUsage.length === 0) {
      return 'REMOVE_MODERN_OR_MIGRATE';
    } else if (comp.legacyUsage.length > 0 && comp.modernUsage.length > 0) {
      return 'MIGRATE_LEGACY_TO_MODERN';
    } else {
      return 'REMOVE_BOTH';
    }
  }

  run() {
    console.log('🚀 Starting Legacy vs Modern Component Analysis...\n');
    
    this.findComponents();
    this.findImports();
    this.analyzeUsage();
    
    const results = this.generateReport();
    this.saveJsonReport();
    
    return results;
  }
}

// Run the analyzer
if (require.main === module) {
  const projectRoot = process.cwd();
  const analyzer = new LegacyModernAnalyzer(projectRoot);
  analyzer.run();
}

module.exports = LegacyModernAnalyzer;
