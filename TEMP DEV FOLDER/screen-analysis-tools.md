# Screen Navigation & Unused Code Analysis Tools

## Quick Start Commands

### 1. Find Unused Code (Knip - Already Configured!)
```bash
# Run full analysis
npx knip

# Show only unused files
npx knip --reporter files

# Show unused exports
npx knip --reporter exports

# Fix some issues automatically
npx knip --fix
```

### 2. Visualize Component Dependencies (Madge)
```bash
# Install globally
npm install -g madge

# Generate visual dependency graph
madge --image dependency-graph.svg src/

# Focus on components only
madge --image components-graph.svg src/components/

# Check for circular dependencies
madge --circular src/

# Analyze specific screen flows
madge --image bloc-screen-deps.svg src/components/bloc/
```

### 3. Advanced Dependency Analysis (dependency-cruiser)
```bash
# Install globally
npm install -g dependency-cruiser

# Initialize configuration
depcruise --init

# Generate SVG dependency graph
depcruise --output-type dot src | dot -T svg > full-dependency-graph.svg

# Generate HTML report
depcruise --output-type html src > dependency-report.html
```

## Specific Analysis for Your App

### Navigation Flow Analysis
Your app has these main navigation patterns:
- Home (`/`) → FarmGISLayout → BlocDataScreen/ModernBlocScreen
- Test page (`/test-modern`) → ModernBlocScreen components
- BlocNavigationContext manages tab navigation within bloc screens

### Key Files to Analyze
- `src/components/BlocDataScreen.tsx` - Legacy bloc screen
- `src/components/bloc/ModernBlocScreen.tsx` - New bloc screen
- `src/contexts/BlocNavigationContext.tsx` - Navigation logic
- `src/app/test-modern/page.tsx` - Test/preview screen

### Commands to Run
```bash
# Check if test-modern page is actually used in production
npx knip --include files | grep test-modern

# Analyze bloc component dependencies
madge --image bloc-analysis.svg src/components/bloc/

# Find circular dependencies in navigation
madge --circular src/contexts/ src/components/bloc/
```

## Expected Findings

Based on your codebase structure, you'll likely find:
1. **Test/Development Files**: `/test-modern` page might be unused in production
2. **Legacy Components**: Old components that might be replaced by modern versions
3. **Navigation Redundancy**: Potential overlap between BlocDataScreen and ModernBlocScreen
4. **Unused Exports**: Components or functions that were refactored but exports remain

## Automation Setup

Add to your package.json scripts:
```json
{
  "scripts": {
    "analyze:unused": "knip",
    "analyze:deps": "madge --circular src/",
    "analyze:visual": "madge --image dependency-graph.svg src/ && open dependency-graph.svg"
  }
}
```
