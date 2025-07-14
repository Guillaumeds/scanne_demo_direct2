# Code Cleanup Analysis - Baseline Report

**Generated:** 2025-01-14  
**Tool:** Knip v5  
**Project:** Farm Management Application (Next.js)

## 📊 Summary

| Category | Count | Impact |
|----------|-------|--------|
| **Unused Files** | 19 | High - Safe to remove |
| **Unused Dependencies** | 16 | High - Reduce bundle size |
| **Unused DevDependencies** | 1 | Low - Development only |
| **Unused Exports** | 100+ | Medium - Code cleanup |
| **Unused Types** | 37 | Low - TypeScript only |
| **Duplicate Exports** | 1 | Medium - Fix required |

## 🗑️ Unused Files (19) - Priority: HIGH

### UI Components (Safe to remove)
- `src/components/ConfigurationHealthCheck.tsx`
- `src/components/DateInput.tsx` 
- `src/components/Header.tsx`
- `src/components/ProductForm.tsx`
- `src/components/SVGOverlay.tsx`
- `src/components/navigation/ModernNavigation.tsx`

### UI Library Components (ShadCN - Safe to remove)
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`

### Services & Utilities
- `src/data/overviewSampleData.ts`
- `src/hooks/use-toast.ts`
- `src/schemas/cropCycleSchema.ts`
- `src/services/attachmentService.ts`
- `src/types/database.ts`
- `src/utils/csvParser.ts`
- `src/utils/uuidHelpers.ts`

## 📦 Unused Dependencies (16) - Priority: HIGH

### UI Libraries
- `@carbon/react` - IBM Carbon Design System
- `@radix-ui/react-dialog` - Dialog components
- `@radix-ui/react-dropdown-menu` - Dropdown components
- `@radix-ui/react-navigation-menu` - Navigation components
- `@radix-ui/react-toast` - Toast notifications
- `@tabler/icons` - Icon library
- `@tremor/react` - Dashboard components

### Data & Visualization
- `@tanstack/react-table` - Table components
- `react-arborist` - Tree components
- `react-beautiful-dnd` - Drag and drop
- `react-icons` - Icon library

### Map & Visualization
- `leaflet-draw` - Drawing tools for maps
- `react-leaflet` - React Leaflet bindings

### Other
- `critters` - CSS inlining
- `playwright` - Testing framework
- `weather-icons` - Weather icon fonts

## 🔧 DevDependencies (1) - Priority: LOW
- `tsx` - TypeScript execution

## ⚠️ Issues to Address

### Unlisted Dependencies (1)
- `ws` - WebSocket library used in `.vscode/test-console-integration.js`

### Unresolved Imports (1)
- `jest-environment-jsdom` - Missing from jest.config.js

### Duplicate Exports (1)
- `SEASON_CATEGORIES|SEASON_FILTERS` in `src/types/varieties.ts`

## 🎯 Cleanup Strategy

### Phase 1: File Cleanup (Immediate)
1. Move unused files to `reference_notused/` directory
2. Test application functionality
3. Verify build process works

### Phase 2: Dependency Cleanup (Immediate)
1. Remove unused dependencies from package.json
2. Run `npm install` to update lock file
3. Test build and development processes

### Phase 3: Export Cleanup (Optional)
1. Remove unused exports from active files
2. Clean up unused types and interfaces
3. Fix duplicate exports

### Phase 4: Maintenance (Ongoing)
1. Set up Knip in CI/CD pipeline
2. Regular cleanup schedule
3. Pre-commit hooks for new unused code

## 💾 Estimated Savings

- **Bundle Size**: ~2-5MB reduction from unused dependencies
- **Build Time**: ~10-20% faster builds
- **Maintenance**: Reduced cognitive load from cleaner codebase
- **Security**: Fewer dependencies = smaller attack surface

## 🚨 Risk Assessment

- **Low Risk**: UI components, utilities, sample data
- **Medium Risk**: Services that might be used dynamically
- **High Risk**: Core dependencies (none identified)

## ✅ Next Steps

1. Execute Phase 1: File cleanup with backup
2. Test application thoroughly
3. Execute Phase 2: Dependency cleanup
4. Verify all functionality works
5. Optional: Phase 3 export cleanup
6. Set up ongoing maintenance
