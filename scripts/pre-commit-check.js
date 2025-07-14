#!/usr/bin/env node

/**
 * Pre-commit hook to prevent committing unused code
 * Add this to your git hooks or CI/CD pipeline
 */

const { execSync } = require('child_process');

class PreCommitCheck {
  constructor() {
    this.projectRoot = process.cwd();
    this.allowedUnusedExports = 50; // Threshold for unused exports
    this.allowedUnusedTypes = 20;   // Threshold for unused types
  }

  // Run Knip check for commit
  runPreCommitCheck() {
    console.log('🔍 Running pre-commit code cleanliness check...');
    
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
          console.warn('⚠️  Could not parse Knip output');
          return null;
        }
      }
      return null;
    }
  }

  // Check if commit should be blocked
  shouldBlockCommit(knipResults) {
    if (!knipResults) {
      console.log('⚠️  Could not run analysis - allowing commit');
      return false;
    }

    const blockers = [];

    // Block if there are unused files
    if (knipResults.files && knipResults.files.length > 0) {
      blockers.push(`${knipResults.files.length} unused files`);
    }

    // Block if there are unused dependencies
    if (knipResults.issues) {
      for (const issue of knipResults.issues) {
        if (issue.file === 'package.json') {
          if (issue.dependencies && issue.dependencies.length > 0) {
            blockers.push(`${issue.dependencies.length} unused dependencies`);
          }
          if (issue.devDependencies && issue.devDependencies.length > 0) {
            blockers.push(`${issue.devDependencies.length} unused devDependencies`);
          }
        }
      }
    }

    // Count exports and types (warnings, not blockers)
    let unusedExports = 0;
    let unusedTypes = 0;

    if (knipResults.issues) {
      for (const issue of knipResults.issues) {
        if (issue.exports) unusedExports += issue.exports.length;
        if (issue.types) unusedTypes += issue.types.length;
      }
    }

    if (blockers.length > 0) {
      console.log('\n🚨 COMMIT BLOCKED - Clean up required:');
      blockers.forEach(blocker => {
        console.log(`  ❌ ${blocker}`);
      });
      
      console.log('\n🛠️  Fix with these commands:');
      console.log('  npm run cleanup:knip      # Remove unused files');
      console.log('  npm run cleanup:deps      # Remove unused dependencies');
      
      return true;
    }

    // Show warnings for exports/types but don't block
    if (unusedExports > this.allowedUnusedExports || unusedTypes > this.allowedUnusedTypes) {
      console.log('\n⚠️  Code quality warnings (not blocking):');
      if (unusedExports > this.allowedUnusedExports) {
        console.log(`  • ${unusedExports} unused exports (threshold: ${this.allowedUnusedExports})`);
      }
      if (unusedTypes > this.allowedUnusedTypes) {
        console.log(`  • ${unusedTypes} unused types (threshold: ${this.allowedUnusedTypes})`);
      }
      console.log('  Consider cleaning these up when convenient');
    }

    console.log('✅ Pre-commit check passed - commit allowed');
    return false;
  }

  // Main check function
  check() {
    const knipResults = this.runPreCommitCheck();
    const shouldBlock = this.shouldBlockCommit(knipResults);
    
    if (shouldBlock) {
      console.log('\n💡 Tip: Run "npm run maintenance:check" for detailed analysis');
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const preCommit = new PreCommitCheck();
  preCommit.check();
}

module.exports = PreCommitCheck;
