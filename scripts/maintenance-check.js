#!/usr/bin/env node

/**
 * Regular maintenance check for code cleanliness
 * Run this weekly to catch new unused code early
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MaintenanceCheck {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'unknown',
      issues: [],
      recommendations: []
    };
  }

  // Run Knip analysis
  runKnipCheck() {
    console.log('🔍 Running Knip maintenance check...');
    
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
          console.warn('⚠️  Could not parse Knip output, running text analysis...');
          return this.parseKnipTextOutput(error.stdout);
        }
      }
      console.error('❌ Knip analysis failed:', error.message);
      return null;
    }
  }

  // Parse text output as fallback
  parseKnipTextOutput(output) {
    const result = {
      files: [],
      issues: [],
      dependencies: [],
      devDependencies: []
    };

    const lines = output.split('\n');
    let currentSection = null;

    for (const line of lines) {
      if (line.includes('Unused files')) {
        currentSection = 'files';
      } else if (line.includes('Unused dependencies')) {
        currentSection = 'dependencies';
      } else if (line.includes('Unused devDependencies')) {
        currentSection = 'devDependencies';
      } else if (line.includes('Unused exports')) {
        currentSection = 'exports';
      } else if (line.trim() && currentSection === 'files') {
        result.files.push(line.trim());
      }
    }

    return result;
  }

  // Analyze results and provide recommendations
  analyzeResults(knipResults) {
    if (!knipResults) {
      this.results.status = 'error';
      this.results.issues.push('Could not run Knip analysis');
      return;
    }

    let issueCount = 0;

    // Check for new unused files
    if (knipResults.files && knipResults.files.length > 0) {
      issueCount += knipResults.files.length;
      this.results.issues.push(`${knipResults.files.length} unused files detected`);
      this.results.recommendations.push('Run cleanup script to remove unused files');
    }

    // Check for new unused dependencies
    if (knipResults.issues) {
      for (const issue of knipResults.issues) {
        if (issue.file === 'package.json') {
          if (issue.dependencies && issue.dependencies.length > 0) {
            issueCount += issue.dependencies.length;
            this.results.issues.push(`${issue.dependencies.length} unused dependencies detected`);
            this.results.recommendations.push('Review and remove unused dependencies');
          }
          if (issue.devDependencies && issue.devDependencies.length > 0) {
            issueCount += issue.devDependencies.length;
            this.results.issues.push(`${issue.devDependencies.length} unused devDependencies detected`);
            this.results.recommendations.push('Review and remove unused devDependencies');
          }
        }
      }
    }

    // Set overall status
    if (issueCount === 0) {
      this.results.status = 'clean';
    } else if (issueCount < 5) {
      this.results.status = 'minor_issues';
    } else {
      this.results.status = 'needs_cleanup';
    }
  }

  // Generate maintenance report
  generateReport() {
    const knipResults = this.runKnipCheck();
    this.analyzeResults(knipResults);

    console.log('\n' + '='.repeat(60));
    console.log('🧹 MAINTENANCE CHECK REPORT');
    console.log('='.repeat(60));

    // Status indicator
    const statusEmoji = {
      'clean': '✅',
      'minor_issues': '⚠️',
      'needs_cleanup': '🚨',
      'error': '❌'
    };

    console.log(`\n${statusEmoji[this.results.status]} Status: ${this.results.status.toUpperCase()}`);

    // Issues found
    if (this.results.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      this.results.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    } else {
      console.log('\n🎉 No issues found - codebase is clean!');
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    // Available commands
    console.log('\n🛠️  Available Cleanup Commands:');
    console.log('  npm run knip              - Full analysis');
    console.log('  npm run cleanup:knip      - Clean unused files');
    console.log('  npm run cleanup:deps      - Clean unused dependencies');

    // Save report
    const reportPath = path.join(this.projectRoot, 'maintenance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      ...this.results,
      knipResults
    }, null, 2));

    console.log(`\n📝 Detailed report saved: ${reportPath}`);

    return this.results;
  }

  // Quick health check
  quickCheck() {
    console.log('⚡ Running quick maintenance check...');
    
    const checks = [
      this.checkPackageJson(),
      this.checkNodeModules(),
      this.checkBuildOutput()
    ];

    const passed = checks.filter(check => check.passed).length;
    const total = checks.length;

    console.log(`\n📊 Quick Check Results: ${passed}/${total} passed`);
    
    checks.forEach(check => {
      const emoji = check.passed ? '✅' : '❌';
      console.log(`${emoji} ${check.name}: ${check.message}`);
    });

    return { passed, total, checks };
  }

  checkPackageJson() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      
      return {
        name: 'Package.json',
        passed: true,
        message: `${depCount} dependencies, ${devDepCount} devDependencies`
      };
    } catch (error) {
      return {
        name: 'Package.json',
        passed: false,
        message: 'Could not read package.json'
      };
    }
  }

  checkNodeModules() {
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    const exists = fs.existsSync(nodeModulesPath);
    
    return {
      name: 'Node Modules',
      passed: exists,
      message: exists ? 'Present and ready' : 'Missing - run npm install'
    };
  }

  checkBuildOutput() {
    const buildPath = path.join(this.projectRoot, '.next');
    const exists = fs.existsSync(buildPath);
    
    return {
      name: 'Build Output',
      passed: true,
      message: exists ? 'Build cache present' : 'No build cache (normal)'
    };
  }
}

// CLI interface
if (require.main === module) {
  const maintenance = new MaintenanceCheck();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    maintenance.quickCheck();
  } else {
    const results = maintenance.generateReport();
    
    // Exit with appropriate code for CI/CD
    if (results.status === 'error') {
      process.exit(1);
    } else if (results.status === 'needs_cleanup') {
      process.exit(2); // Indicates cleanup needed
    } else {
      process.exit(0); // Success
    }
  }
}

module.exports = MaintenanceCheck;
