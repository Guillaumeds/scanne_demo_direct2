# Legacy Components Moved - July 14, 2025

This folder contains legacy components that were moved out of the active `src/components` directory to clean up the codebase after implementing the new modern farming operations management system.

## Moved Components:

### Individual Files:
- `AttachmentUploader.tsx` - Legacy file attachment component
- `EquipmentSelector.tsx` - Legacy equipment selection component  
- `ModernOverviewTab.tsx` - Legacy overview tab (replaced by new farm system)
- `ProductSelector.tsx` - Legacy product selection component
- `SoilDataTab.tsx` - Legacy soil data display (only used by old ModernBlocContent)
- `VegetationDataTab.tsx` - Legacy vegetation data display (only used by old ModernBlocContent)
- `WeatherDashboard.tsx` - Legacy weather dashboard (only used by old ModernBlocContent)

### Directories:
- `bloc/` - Legacy Modern* bloc components (replaced by new `farm/` system)
  - `ModernBlocBreadcrumbs.tsx`
  - `ModernBlocContent.tsx`
  - `ModernBlocNavigation.tsx`
  - `ModernBlocScreen.tsx`
  - `tabs/ModernCropManagementTab.tsx`
  - `tabs/ModernInformationTab.tsx`
  - `tabs/ModernObservationsTab.tsx`

- `forms/` - Legacy form components (replaced by new `farm/forms/`)
  - `ModernOperationsForm.tsx`
  - `ModernWorkPackageForm.tsx`

- `layouts/` - Legacy layout components
  - `FormLayout.tsx`

- `tables/` - Legacy table components (replaced by new TanStack Table implementation)
  - `ModernOverviewTable.tsx`

- `reference/` - Previous reference components
  - `ModernOverviewTab.tsx`
  - `README.md`
  - `bloc/ModernBlocScreen.tsx`

- `__tests__/` - Legacy test files
  - `ModernOverviewTab.test.tsx`

## What Remains Active:

### GIS/Map Components (Preserved):
- `FarmGISLayout.tsx` - Main GIS layout (updated to use new BlocScreen)
- `MapComponent.tsx` - Core map functionality
- `BlocList.tsx` - Bloc listing for map
- `DrawingToolbar.tsx` - Map drawing tools
- `DrawnAreasList.tsx` - Drawn areas management
- `PolygonInfoModal.tsx` - Polygon information display
- `FloatingInfoBox.tsx` - Map info display
- `DrawingManager.tsx` - Drawing functionality
- `DrawingProgress.tsx` - Drawing progress indicator
- `LayerSelector.tsx` - Map layer selection
- `MapLegend.tsx` - Map legend display
- `SentinelOverlaySelector.tsx` - Satellite overlay selection

### New Farm System (Active):
- `farm/` - Complete new farming operations management system
  - `BlocScreen.tsx` - New bloc screen entry point
  - `contexts/` - React contexts for state management
  - `forms/` - Modern forms with React Hook Form + Zod
  - `information/` - Information dashboard components
  - `layout/` - Layout components for farm system
  - `operations/` - Operations management with 3 views/3 perspectives
  - `shared/` - Shared utilities and components

### UI Components (Active):
- `ui/` - ShadCN UI components (all preserved)

## Reason for Move:

These components were moved because:
1. They were replaced by the new modern farming operations management system
2. They used outdated patterns and dependencies
3. They were causing confusion for AI development assistance
4. The new system provides better UX/UI with modern tech stack

## DO NOT:
- Import these components in the active application
- Use these for new development
- Modify these components

## Reference Only:
These components are kept for reference to understand:
- Previous data structures
- Legacy business logic
- Migration patterns
- Historical implementation approaches
