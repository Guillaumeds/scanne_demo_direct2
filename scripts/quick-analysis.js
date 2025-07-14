#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Analysis of Potentially Unused Files');
console.log('='.repeat(50));

// Get all TypeScript/JavaScript files
function getAllFiles(dir = 'src', files = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        getAllFiles(fullPath, files);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          files.push(fullPath.replace(/\\/g, '/'));
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${dir}`);
  }
  
  return files;
}

// Simple import detection
function findImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Simple regex for imports
    const importRegex = /(?:import|from)\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        imports.push(importPath);
      }
    }
    
    return imports;
  } catch (error) {
    return [];
  }
}

// Main analysis
const allFiles = getAllFiles();
console.log(`📁 Found ${allFiles.length} source files`);

const importedPaths = new Set();

// Collect all imports
for (const file of allFiles) {
  const imports = findImports(file);
  for (const imp of imports) {
    importedPaths.add(imp);
  }
}

console.log(`🔗 Found ${importedPaths.size} import references`);

// Check for obvious unused files
const suspiciousFiles = [];
const legacyFiles = [];

for (const file of allFiles) {
  const fileName = path.basename(file, path.extname(file));
  const isImported = Array.from(importedPaths).some(imp => 
    imp.includes(fileName) || imp.includes(file.replace('src/', ''))
  );
  
  // Check for legacy patterns
  if (file.includes('legacy') || file.includes('old') || file.includes('backup')) {
    legacyFiles.push(file);
  } else if (!isImported) {
    // Skip special Next.js files
    if (!file.includes('page.tsx') && !file.includes('layout.tsx') && 
        !file.includes('globals.css') && !file.endsWith('.d.ts')) {
      suspiciousFiles.push(file);
    }
  }
}

console.log('\n📊 ANALYSIS RESULTS');
console.log('='.repeat(30));

console.log(`\n🗑️  Legacy files (${legacyFiles.length}):`);
legacyFiles.forEach(file => console.log(`  - ${file}`));

console.log(`\n⚠️  Suspicious files (${suspiciousFiles.length}):`);
suspiciousFiles.slice(0, 20).forEach(file => console.log(`  - ${file}`));

if (suspiciousFiles.length > 20) {
  console.log(`  ... and ${suspiciousFiles.length - 20} more`);
}

// Save results
const results = {
  totalFiles: allFiles.length,
  legacyFiles,
  suspiciousFiles,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('quick-analysis-results.json', JSON.stringify(results, null, 2));
console.log('\n📝 Results saved to: quick-analysis-results.json');

console.log('\n💡 Next steps:');
console.log('1. Review the legacy files - these are likely safe to move');
console.log('2. Check suspicious files manually');
console.log('3. Run the full analysis: npm run analyze:unused');
console.log('4. Use safe cleanup: npm run cleanup:safe');
