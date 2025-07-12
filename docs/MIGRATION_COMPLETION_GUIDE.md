# 🚀 **Complete Migration Guide for Augment Code**

## 📋 **Current Status**

✅ **Completed:**
- Wave 1: Core Infrastructure (Icons, Animations, Feature Flags)
- Wave 2: Forms & Tables (Basic structure, Add buttons)

🔄 **Remaining:**
- Wave 3: BlocDataScreen Integration (Replace entire screen)
- Wave 4: Testing & Validation

---

## 🎯 **Wave 3: Complete BlocDataScreen Integration**

### **Objective**
Replace the entire `BlocDataScreen` with `ModernBlocScreen` to enable the full modern navigation experience with breadcrumbs, sidebar navigation, and modern layout.

### **Step 1: Update Feature Flags**

**File:** `src/lib/featureFlags.ts`

**Change:**
```typescript
// Line 33-37: Enable modern bloc screen
useModernOverviewTab: true, // ✅ Already enabled
useModernOperationsForm: true, // ✅ Already enabled  
useModernWorkPackageForm: true, // ✅ Already enabled
useModernProductSelector: false, // Keep false for now
useModernNavigation: true, // ✅ ENABLE THIS
```

### **Step 2: Update BlocDataScreen Integration**

**File:** `src/components/BlocDataScreen.tsx`

**Find the main component wrapper (around line 775):**
```typescript
export default function BlocDataScreen({ bloc, onBack, onDelete }: BlocDataScreenProps) {
```

**Replace with:**
```typescript
export default function BlocDataScreen({ bloc, onBack, onDelete }: BlocDataScreenProps) {
  // Validate that bloc is saved and has UUID before creating crop cycles
  if (!bloc.uuid) {
    throw new Error(`Cannot open bloc details: Bloc "${bloc.localId}" must be saved to database first`)
  }

  // Check feature flags
  const flags = getFeatureFlags()
  
  if (flags.useModernNavigation) {
    // Use modern bloc screen
    return (
      <ModernBlocScreen
        bloc={bloc}
        onBack={onBack}
        onDelete={onDelete}
      />
    )
  }

  // Use legacy bloc screen
  return (
    <CropCycleProvider blocId={bloc.uuid} userRole="user">
      <SelectedCropCycleProvider>
        <BlocDataScreenInner bloc={bloc} onBack={onBack} onDelete={onDelete} />
      </SelectedCropCycleProvider>
    </CropCycleProvider>
  )
}
```

**Add import at top:**
```typescript
import { ModernBlocScreen } from './bloc/ModernBlocScreen'
```

### **Step 3: Fix Missing Navigation Links**

**File:** `src/components/bloc/ModernBlocNavigation.tsx`

**Find the navigationItems array (around line 25):**
```typescript
const navigationItems = [
  {
    id: 'information' as const,
    name: 'Information',
    icon: 'settings' as const,
    description: 'Bloc details and crop cycle information',
    isEnabled: true
  },
  // ... existing items
]
```

**Add footer navigation items:**
```typescript
const footerNavigationItems = [
  {
    id: 'weather' as const,
    name: 'Weather',
    icon: 'weather' as const,
    description: 'Weather data and forecasts',
    isEnabled: true
  },
  {
    id: 'satellite-soil' as const,
    name: 'Soil Data',
    icon: 'location' as const,
    description: 'Satellite soil analysis',
    isEnabled: true
  },
  {
    id: 'satellite-vegetation' as const,
    name: 'Vegetation',
    icon: 'crop' as const,
    description: 'Satellite vegetation analysis',
    isEnabled: true
  }
]
```

**Add footer section in the render (before closing div):**
```typescript
{/* Footer Navigation */}
<div className="border-t border-slate-200 p-4">
  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
    Satellite & Weather
  </h4>
  <div className="space-y-1">
    {footerNavigationItems.map((item) => (
      <Button
        key={item.id}
        variant="ghost"
        className="w-full justify-start h-auto p-3 text-left"
        onClick={() => handleTabClick(item.id)}
      >
        <Icon name={item.icon} className="mr-3 text-slate-600" />
        <div>
          <div className="font-medium text-sm">{item.name}</div>
          <div className="text-xs text-slate-500">{item.description}</div>
        </div>
      </Button>
    ))}
  </div>
</div>
```

### **Step 4: Add Missing Tab Content**

**File:** `src/components/bloc/ModernBlocContent.tsx`

**Add new cases to the switch statement:**
```typescript
case 'weather':
  return (
    <div className="p-6">
      <WeatherDashboard drawnAreas={[{
        id: bloc.uuid || bloc.localId,
        coordinates: bloc.coordinates,
        area: bloc.area,
        name: bloc.name
      }]} />
    </div>
  )

case 'satellite-soil':
  return (
    <div className="p-6">
      <SoilDataTab bloc={{
        id: bloc.uuid || bloc.localId,
        coordinates: bloc.coordinates,
        area: bloc.area,
        name: bloc.name || `Bloc ${bloc.localId}`
      }} />
    </div>
  )

case 'satellite-vegetation':
  return (
    <div className="p-6">
      <VegetationDataTab bloc={{
        id: bloc.uuid || bloc.localId,
        coordinates: bloc.coordinates,
        area: bloc.area,
        name: bloc.name || `Bloc ${bloc.localId}`
      }} />
    </div>
  )
```

**Add imports at top:**
```typescript
import WeatherDashboard from '@/components/WeatherDashboard'
import SoilDataTab from '@/components/SoilDataTab'
import VegetationDataTab from '@/components/VegetationDataTab'
```

### **Step 5: Update Navigation Context Types**

**File:** `src/contexts/BlocNavigationContext.tsx`

**Update BlocTab type:**
```typescript
export type BlocTab = 'information' | 'crop-management' | 'observations' | 'weather' | 'satellite-soil' | 'satellite-vegetation'
```

---

## 🧪 **Wave 4: Testing & Validation**

### **Step 1: Enable Full Modern Experience**

**Test URL:** `http://localhost:3000?modernAll=true`

### **Step 2: Test Navigation Flow**

1. ✅ Open a bloc → Should show ModernBlocScreen
2. ✅ Navigate between tabs → Should show breadcrumbs
3. ✅ Access weather/satellite tabs → Should work
4. ✅ Create operations → Should open modern forms
5. ✅ Edit work packages → Should open modern forms

### **Step 3: Fallback Testing**

**Disable modern navigation:**
```typescript
// In featureFlags.ts
useModernNavigation: false
```

Should fall back to legacy BlocDataScreen.

---

## 🔧 **Component-by-Component Fixes (After Migration)**

### **Priority 1: ModernOverviewTable**
- Fix missing columns from original table
- Add proper work package headers
- Fix status badges and calculations
- Add proper financial/resource views

### **Priority 2: Modern Forms**
- Ensure all form fields match original
- Add proper validation
- Fix save/cancel behavior
- Add proper loading states

### **Priority 3: Navigation Polish**
- Add proper breadcrumb updates
- Fix tab state management
- Add unsaved changes warnings
- Polish animations

---

## 🎯 **Success Criteria**

### **Migration Complete When:**
1. ✅ ModernBlocScreen fully replaces BlocDataScreen
2. ✅ All navigation tabs work (Information, Crop Management, Observations, Weather, Satellite)
3. ✅ Add buttons create operations and work packages
4. ✅ Forms open and save properly
5. ✅ Breadcrumbs show correct hierarchy
6. ✅ Feature flags allow easy rollback

### **Ready for Component Fixes When:**
1. ✅ Overall architecture is working
2. ✅ Navigation flows are complete
3. ✅ Data flows between components
4. ✅ No major structural issues

---

## 📝 **Implementation Notes**

- **Keep feature flags** for easy rollback during testing
- **Test incrementally** - enable one feature at a time
- **Preserve data flow** - ensure all props pass correctly
- **Maintain compatibility** - legacy components should still work

**After completing this migration, we'll have the full modern architecture working, then we can systematically fix each component's detailed functionality.**

---

## 📋 **Detailed Component Fix Checklist (Post-Migration)**

### **🔧 Component Fix Priority Order**

#### **1. ModernOverviewTable (Highest Priority)**
**Issues to Fix:**
- [ ] Missing table columns from original (compare with OverviewTab.tsx)
- [ ] Work package section headers not showing properly
- [ ] Add buttons positioning in headers
- [ ] Status calculations and progress bars
- [ ] Financial view columns and calculations
- [ ] Resource view columns
- [ ] Proper row expansion/collapse
- [ ] Edit button functionality
- [ ] Date formatting consistency
- [ ] Units in column headers (Rs/MUR, ha, tons, etc.)

**Augment Prompt:**
```
Fix ModernOverviewTable component to match exact functionality of original OverviewTab table:

1. Compare src/components/tables/ModernOverviewTable.tsx with src/components/OverviewTab.tsx
2. Add all missing columns that exist in original table
3. Fix work package section headers with proper add buttons
4. Ensure all three views (Operations, Resources, Financial) have correct columns
5. Add proper status badges and progress calculations
6. Fix row expansion/collapse behavior
7. Add units to column headers (Rs/MUR for costs, ha for area, etc.)
8. Ensure edit buttons open correct forms
9. Test with real data to ensure all functionality works

Focus on feature parity first, then polish styling.
```

#### **2. ModernOperationsForm (High Priority)**
**Issues to Fix:**
- [ ] Missing form fields from original
- [ ] Tab structure and navigation
- [ ] Product selection integration
- [ ] Equipment selection integration
- [ ] Validation rules
- [ ] Save/cancel behavior
- [ ] Loading states
- [ ] Error handling

**Augment Prompt:**
```
Fix ModernOperationsForm to match exact functionality of original operations form:

1. Compare src/components/forms/ModernOperationsForm.tsx with original form components
2. Ensure all tabs (Basic Info, Products, Resources, Financials, Notes) have correct fields
3. Fix product selection to match original selector behavior
4. Add equipment selection functionality
5. Implement proper form validation with Zod
6. Fix save/cancel behavior to update data correctly
7. Add loading states and error handling
8. Test form submission and data persistence

Ensure form opens correctly from table edit buttons.
```

#### **3. ModernWorkPackageForm (High Priority)**
**Issues to Fix:**
- [ ] Missing form fields
- [ ] Resource tracking
- [ ] Progress monitoring
- [ ] Status management
- [ ] Date/time inputs
- [ ] Equipment integration
- [ ] Cost calculations

**Augment Prompt:**
```
Fix ModernWorkPackageForm to match original work package form functionality:

1. Compare with original work package form components
2. Add all missing form fields (area, quantity, rate, status, etc.)
3. Fix resource tracking and equipment integration
4. Implement proper progress monitoring
5. Add cost calculations and financial tracking
6. Fix date/time inputs and validation
7. Ensure status management works correctly
8. Test form submission and data updates

Focus on daily work package tracking functionality.
```

#### **4. Navigation & Breadcrumbs (Medium Priority)**
**Issues to Fix:**
- [ ] Breadcrumb hierarchy updates
- [ ] Tab state persistence
- [ ] Unsaved changes warnings
- [ ] Back button behavior
- [ ] URL state management

**Augment Prompt:**
```
Fix navigation and breadcrumb system in ModernBlocScreen:

1. Ensure breadcrumbs update correctly for all navigation levels
2. Fix tab state persistence when switching between tabs
3. Add unsaved changes warnings before navigation
4. Fix back button behavior and navigation history
5. Test all navigation flows and edge cases
6. Ensure URL state reflects current navigation state

Focus on smooth navigation experience.
```

#### **5. Data Integration (Medium Priority)**
**Issues to Fix:**
- [ ] Real data loading instead of mock data
- [ ] CRUD operations integration
- [ ] Database persistence
- [ ] Error handling
- [ ] Loading states

**Augment Prompt:**
```
Replace mock data with real data integration in modern components:

1. Connect ModernOverviewTab to real operations data
2. Integrate with existing CRUD operations
3. Ensure database persistence for all operations
4. Add proper error handling and loading states
5. Test with real bloc data and operations
6. Ensure data consistency across components

Focus on data flow and persistence.
```

### **🧪 Testing Strategy for Each Component**

#### **Component Testing Template:**
```
For each component fix:

1. **Before Fix:** Document current issues with screenshots
2. **During Fix:** Test incrementally with real data
3. **After Fix:** Verify feature parity with original
4. **Integration Test:** Ensure component works with others
5. **User Test:** Test actual user workflows

Use feature flags to enable/disable fixes for safe testing.
```

### **📊 Progress Tracking**

Create tasks for each component fix and track progress:
- [ ] ModernOverviewTable fixes
- [ ] ModernOperationsForm fixes
- [ ] ModernWorkPackageForm fixes
- [ ] Navigation fixes
- [ ] Data integration fixes
- [ ] Final testing and polish

**This systematic approach ensures we fix each component thoroughly while maintaining the overall modern architecture.**
