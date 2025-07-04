# 📱 Form-Level Calculation Guidelines

## 🎯 **Purpose and Scope**

This document defines best practices for **form-level calculations** that provide real-time user feedback during data entry. These calculations are **UX-only** and never replace authoritative database calculations.

## 🏗️ **Architecture Principles**

### **✅ Two-Tier Calculation System**

```typescript
// 📱 TIER 1: Form-Level UX Calculations (Real-time feedback)
const formFeedback = CropCycleCalculationService.calculateFormFeedback({
  yieldPerHectare: 85,
  areaHectares: 2.5,
  pricePerTonne: 120
})
// Result: { isTemporary: true, totalYield: 212.5, totalRevenue: 25500, ... }

// 🏛️ TIER 2: Database Authoritative Calculations (Stored results)
const authoritativeTotals = await CropCycleCalculationService.getAuthoritativeTotals(cycleId)
// Result: { estimatedTotalCost: 15000, actualTotalCost: 14750, ... }
```

### **🔄 Clear Separation of Concerns**

| **Form Calculations** | **Database Calculations** |
|----------------------|---------------------------|
| ✅ Real-time feedback | ✅ Authoritative results |
| ✅ Immediate UX response | ✅ Precise DECIMAL arithmetic |
| ✅ JavaScript floating point | ✅ Atomic transactions |
| ❌ Never stored directly | ✅ Single source of truth |
| ❌ Not authoritative | ✅ Used for business logic |

## 📋 **Implementation Guidelines**

### **1. 🏷️ Always Mark as UX-Only**

```typescript
// ✅ GOOD: Clear UX-only marking
const handleYieldPerHaChange = (value: string) => {
  // 📱 UX ONLY: Auto-calculate total yield when yield per hectare changes
  // This provides immediate feedback but database stores authoritative totals
  const yieldPerHa = value ? parseFloat(value) : undefined
  updateField('yieldPerHectare', yieldPerHa)
  
  // Use calculation service for consistency
  const feedback = CropCycleCalculationService.calculateFormFeedback({
    yieldPerHectare: yieldPerHa,
    areaHectares: blocArea
  })
  
  if (feedback.totalYield) {
    updateField('totalYieldTons', feedback.totalYield)
  }
}

// ❌ BAD: No clear indication of purpose
const handleYieldChange = (value: string) => {
  const yield = parseFloat(value)
  const total = yield * area // Unclear if this is authoritative
  updateField('total', total)
}
```

### **2. 🧮 Use CropCycleCalculationService**

```typescript
// ✅ GOOD: Consistent calculation service
const feedback = CropCycleCalculationService.calculateFormFeedback({
  yieldPerHectare: 85,
  areaHectares: 2.5,
  pricePerTonne: 120
})

// ❌ BAD: Inline calculations
const totalYield = yieldPerHa * area
const totalRevenue = totalYield * pricePerTonne
```

### **3. 💡 Provide User Feedback**

```tsx
// ✅ GOOD: Clear user communication
<div className="bg-green-50 border border-green-200 rounded-md p-2 mb-3">
  <div className="flex items-center space-x-2">
    <span className="text-green-600">🧮</span>
    <span className="text-xs text-green-800 font-medium">Smart Calculations</span>
  </div>
  <p className="text-xs text-green-700 mt-1">
    Values auto-calculate as you type for immediate feedback. Database stores final authoritative totals when saved.
  </p>
</div>

// ❌ BAD: No user communication about calculation nature
<input onChange={handleCalculation} /> {/* User doesn't know this is temporary */}
```

### **4. 🔄 Handle Edge Cases Gracefully**

```typescript
// ✅ GOOD: Robust error handling
const handleYieldCalculation = (value: string) => {
  const yieldValue = value ? parseFloat(value) : undefined
  
  if (!yieldValue || !blocArea || blocArea <= 0) {
    // Clear dependent fields if calculation isn't possible
    updateField('totalYield', undefined)
    updateField('totalRevenue', undefined)
    return
  }
  
  try {
    const feedback = CropCycleCalculationService.calculateFormFeedback({
      yieldPerHectare: yieldValue,
      areaHectares: blocArea
    })
    
    if (feedback.totalYield) {
      updateField('totalYield', feedback.totalYield)
    }
  } catch (error) {
    console.warn('Form calculation failed:', error)
    // Don't break the form - just skip the calculation
  }
}

// ❌ BAD: No error handling
const handleYieldCalculation = (value: string) => {
  const total = parseFloat(value) * blocArea // Could crash on invalid input
  updateField('totalYield', total)
}
```

## 🎯 **Specific Use Cases**

### **📊 Yield Calculations**

```typescript
// Auto-calculate between total yield and yield per hectare
const handleYieldPerHaChange = (value: string) => {
  const yieldPerHa = value ? parseFloat(value) : undefined
  updateField('yieldPerHectare', yieldPerHa)

  if (yieldPerHa && blocArea && blocArea > 0) {
    const feedback = CropCycleCalculationService.calculateFormFeedback({
      yieldPerHectare: yieldPerHa,
      areaHectares: blocArea,
      pricePerTonne: data.pricePerTonne
    })
    
    if (feedback.totalYield) {
      updateField('totalYieldTons', feedback.totalYield)
    }
    
    if (feedback.totalRevenue) {
      updateField('totalRevenue', feedback.totalRevenue)
    }
  }
}
```

### **💰 Revenue Calculations**

```typescript
// Auto-calculate revenue from price and yield
const handlePriceChange = (value: string) => {
  const pricePerTonne = value ? parseFloat(value) : undefined
  updateField('pricePerTonne', pricePerTonne)

  if (pricePerTonne && data.totalYieldTons) {
    const feedback = CropCycleCalculationService.calculateFormFeedback({
      pricePerTonne,
      totalYield: data.totalYieldTons,
      areaHectares: blocArea
    })
    
    if (feedback.totalRevenue) {
      updateField('totalRevenue', feedback.totalRevenue)
    }
    
    if (feedback.revenuePerHectare) {
      updateField('revenuePerHa', feedback.revenuePerHectare)
    }
  }
}
```

### **💸 Activity Cost Calculations**

```typescript
// Calculate activity costs for immediate feedback
const calculateActivityCosts = (products: any[], resources: any[]) => {
  const costs = CropCycleCalculationService.calculateActivityFormCosts(products, resources)
  
  return {
    estimatedTotal: costs.estimatedTotal,
    actualTotal: costs.actualTotal,
    hasActualCosts: costs.hasActualCosts,
    note: costs.note // "Form calculation for UX only..."
  }
}
```

## ⚠️ **Common Pitfalls to Avoid**

### **1. 🚫 Don't Store Form Calculations Directly**

```typescript
// ❌ BAD: Storing form calculation results
const formTotal = calculateFormTotal(products)
await saveActivity({ ...activity, totalCost: formTotal }) // Wrong!

// ✅ GOOD: Let database calculate authoritative totals
await saveActivity(activity) // Database function calculates totals
const authoritativeTotals = await CropCycleCalculationService.triggerRecalculation(cycleId)
```

### **2. 🚫 Don't Mix Form and Database Logic**

```typescript
// ❌ BAD: Mixing concerns
const handleSave = async () => {
  const formTotal = calculateFormTotal() // Form calculation
  const dbTotal = await getDbTotal() // Database calculation
  const finalTotal = (formTotal + dbTotal) / 2 // Confusion!
}

// ✅ GOOD: Clear separation
const handleSave = async () => {
  await saveActivity(activity) // Database handles calculations
  const authoritativeTotals = await CropCycleCalculationService.getAuthoritativeTotals(cycleId)
  updateUI(authoritativeTotals) // Use authoritative results for display
}
```

### **3. 🚫 Don't Assume Form Calculations Are Accurate**

```typescript
// ❌ BAD: Using form calculations for business logic
if (formCalculatedProfit > 10000) {
  showProfitAlert() // Based on potentially inaccurate form calculation
}

// ✅ GOOD: Use authoritative calculations for business logic
const totals = await CropCycleCalculationService.getAuthoritativeTotals(cycleId)
if (totals.profitPerHectare > 10000) {
  showProfitAlert() // Based on precise database calculation
}
```

## 📈 **Performance Considerations**

### **1. ⚡ Debounce Rapid Calculations**

```typescript
import { debounce } from 'lodash'

// ✅ GOOD: Debounced calculations
const debouncedCalculation = debounce((value: string) => {
  const feedback = CropCycleCalculationService.calculateFormFeedback({
    yieldPerHectare: parseFloat(value),
    areaHectares: blocArea
  })
  updateCalculatedFields(feedback)
}, 300) // Wait 300ms after user stops typing

const handleYieldChange = (value: string) => {
  updateField('yieldPerHectare', value) // Immediate field update
  debouncedCalculation(value) // Debounced calculation
}
```

### **2. 🎯 Only Calculate When Necessary**

```typescript
// ✅ GOOD: Conditional calculations
const handleFieldChange = (field: string, value: any) => {
  updateField(field, value)
  
  // Only recalculate if the changed field affects calculations
  if (['yieldPerHectare', 'totalYield', 'pricePerTonne'].includes(field)) {
    recalculateFormFeedback()
  }
}
```

## 🧪 **Testing Form Calculations**

```typescript
// Test form calculations separately from database logic
describe('Form Calculations', () => {
  test('should calculate total yield from per-hectare yield', () => {
    const feedback = CropCycleCalculationService.calculateFormFeedback({
      yieldPerHectare: 85,
      areaHectares: 2.5
    })
    
    expect(feedback.totalYield).toBe(212.5)
    expect(feedback.isTemporary).toBe(true)
    expect(feedback.note).toContain('UX feedback only')
  })
  
  test('should handle invalid inputs gracefully', () => {
    const feedback = CropCycleCalculationService.calculateFormFeedback({
      yieldPerHectare: -10, // Invalid
      areaHectares: 0 // Invalid
    })
    
    expect(feedback.totalYield).toBeUndefined()
  })
})
```

## 🎯 **Summary**

Form-level calculations provide essential **real-time user feedback** while maintaining clear separation from **authoritative database calculations**. Always:

1. ✅ Mark calculations as UX-only
2. ✅ Use CropCycleCalculationService for consistency  
3. ✅ Provide clear user communication
4. ✅ Handle edge cases gracefully
5. ✅ Never store form calculations directly
6. ✅ Use database results for business logic

This approach ensures excellent user experience while maintaining data integrity and system reliability! 🚀
