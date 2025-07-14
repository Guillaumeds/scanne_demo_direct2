# Safe Code Cleanup Guide - Community Best Practices

This guide provides a systematic approach based on **community research and professional tools** to safely identify and clean up unused files after your migration without breaking your application.

## 🎯 Overview - Research-Based Approach

After researching community forums, Context7 documentation, and best practices, **Knip** emerged as the gold standard tool for unused code detection. This guide now uses Knip as the primary method, with custom scripts as backup options.

### **Why Knip is Recommended by the Community:**
- ✅ **Purpose-built** for finding unused files, dependencies, and exports
- ✅ **TypeScript compiler API** for accurate analysis
- ✅ **60+ built-in plugins** for frameworks (Next.js, React, etc.)
- ✅ **Actively maintained** and designed specifically for this purpose
- ✅ **Monorepo support** with workspace awareness
- ✅ **Community consensus**: "This is the dead code removal tool of my dreams" - Effective TypeScript

## 🛠️ Tools Provided

### 1. TypeScript-Aware Analyzer (`typescript-unused-analyzer.js`)
- Uses TypeScript compiler API for accurate analysis
- Understands Next.js App Router patterns
- Categorizes files by confidence level
- **Most reliable method**

### 2. Static Analysis Tool (`find-unused-files.js`)
- Scans import statements across all files
- Identifies files not referenced anywhere
- Good for catching obvious unused files

### 3. Safe Cleanup Script (`safe-cleanup.js`)
- Moves files to `reference_notused/` directory
- Preserves directory structure
- Creates restoration scripts
- Generates detailed manifests

## 📋 Step-by-Step Process

### Step 1: Run Analysis

Choose your preferred analysis method:

```bash
# Recommended: TypeScript-aware analysis
npm run analyze:unused

# Alternative: Simple static analysis
npm run analyze:unused-simple
```

This will generate a detailed report showing:
- ✅ **Safe files** - Keep these (configs, tests, special patterns)
- 🗑️ **Definitely unused** - Safe to move (legacy folders, etc.)
- ⚠️ **Probably unused** - Need review but likely unused
- 🔍 **Need review** - Files that might be used in non-obvious ways

### Step 2: Review the Analysis

The analysis creates a JSON report with detailed categorization:

```json
{
  "definitelyUnused": ["legacy ts/old-file.ts"],
  "probablyUnused": ["src/components/UnusedComponent.tsx"],
  "safe": [
    {
      "path": "src/app/page.tsx",
      "reason": "Next.js page"
    }
  ]
}
```

### Step 3: Safe Cleanup

Run the cleanup script to move unused files:

```bash
npm run cleanup:safe
```

This will:
- Create `reference_notused/cleanup_YYYY-MM-DD/` directory
- Move identified unused files while preserving structure
- Generate a manifest file tracking all changes
- Create a restoration script for easy recovery

### Step 4: Test Your Application

**Critical step** - Test thoroughly after cleanup:

```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build

# Run your application
npm run dev
```

### Step 5: Manual Review (If Needed)

If tests fail or you notice issues:

1. **Check the manifest**: `reference_notused/cleanup_YYYY-MM-DD/cleanup-manifest.json`
2. **Restore specific files**: Copy them back from the backup directory
3. **Full restoration**: Run the generated restore script

```bash
# Restore all files from a cleanup session
node reference_notused/cleanup_YYYY-MM-DD/restore.js
```

## 🔍 What Files Are Considered Safe?

The analysis automatically keeps:

### Next.js Special Files
- `page.tsx/ts/jsx/js` - Route pages
- `layout.tsx/ts/jsx/js` - Layout components
- `loading.tsx/ts/jsx/js` - Loading components
- `error.tsx/ts/jsx/js` - Error boundaries
- `not-found.tsx/ts/jsx/js` - 404 pages
- `route.ts/js` - API routes

### Configuration Files
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `package.json`
- `jest.config.js`

### Test Files
- `*.test.ts/tsx/js/jsx`
- `*.spec.ts/tsx/js/jsx`

### Type Definitions
- `*.d.ts` files

### CSS Files
- `globals.css`
- Other CSS files (often imported dynamically)

## ⚠️ Files That Need Manual Review

Some files might be used in ways that static analysis can't detect:

### Dynamic Imports
```typescript
// These might not be caught by static analysis
const Component = await import(`./components/${componentName}`)
```

### String-based References
```typescript
// File paths constructed at runtime
const imagePath = `/images/${category}/${filename}.jpg`
```

### Configuration References
```typescript
// Files referenced in config objects
const routes = {
  dashboard: () => import('./pages/Dashboard')
}
```

## 🚨 Red Flags - Don't Move These

Be extra careful with:

- Files in `public/` directory (static assets)
- CSS files (might be imported globally)
- Files with side effects (might run on import)
- API route files
- Middleware files
- Files referenced in `next.config.js`

## 📁 Backup Structure

The cleanup creates this structure:

```
reference_notused/
└── cleanup_2025-01-15/
    ├── cleanup-manifest.json     # Detailed log of moved files
    ├── restore.js               # Script to restore all files
    ├── src/                     # Moved files in original structure
    │   ├── components/
    │   └── utils/
    └── legacy ts/               # Moved legacy files
```

## 🔄 Recovery Options

### Restore Individual Files
```bash
# Copy specific files back
cp reference_notused/cleanup_2025-01-15/src/components/MyComponent.tsx src/components/
```

### Restore All Files
```bash
# Run the generated restoration script
node reference_notused/cleanup_2025-01-15/restore.js
```

### Partial Restoration
Edit the `restore.js` script to restore only specific files.

## 🧪 Testing Strategy

After cleanup, test these areas thoroughly:

1. **Build Process**: `npm run build`
2. **Type Checking**: `npx tsc --noEmit`
3. **Linting**: `npm run lint`
4. **Application Startup**: `npm run dev`
5. **All Major Features**: Navigate through your app
6. **API Routes**: Test all endpoints
7. **Dynamic Imports**: Test features that load components dynamically

## 💡 Best Practices

1. **Start Small**: Run analysis first, review results carefully
2. **Backup Everything**: The scripts do this automatically
3. **Test Incrementally**: Test after each cleanup session
4. **Keep Manifests**: Don't delete backup directories immediately
5. **Version Control**: Commit your changes after successful cleanup
6. **Team Communication**: Inform team members about moved files

## 🚀 Advanced Usage

### Custom Analysis
You can modify the analysis scripts to:
- Add custom file patterns to always keep
- Exclude specific directories
- Add custom import pattern detection

### Batch Processing
For large codebases, consider:
- Running analysis on specific directories
- Processing files in smaller batches
- Using git branches for each cleanup session

## 📞 Troubleshooting

### Analysis Shows No Unused Files
- Check if all imports are being detected correctly
- Verify TypeScript compilation is working
- Look for dynamic imports or string-based references

### Application Breaks After Cleanup
1. Check the console for missing file errors
2. Review the manifest for recently moved files
3. Restore suspected files and test again
4. Use git diff to see what changed

### False Positives
Some files might be marked as unused but are actually needed:
- Files imported via dynamic imports
- Files referenced in configuration
- Files used by build tools or plugins

Remember: **It's better to keep a file you're unsure about than to break your application!**
