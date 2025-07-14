---
type: "always_apply"
---

# Design Patterns Rules (Auto)

**Rule Type**: Auto
**Description**: Design consistency, color palette, and UX patterns for Farm Management project

## 🎨 Design Consistency Requirements

### Color Palette - Emerald Only
**MUST use Emerald color palette throughout the entire application**

```css
/* ✅ CORRECT: Emerald palette usage */
Primary: emerald-600, emerald-700
Secondary: emerald-100, emerald-200  
Success: emerald-500
Backgrounds: emerald-50, emerald-100
Text: emerald-900, emerald-800
Borders: emerald-200, emerald-300
Hover states: emerald-700, emerald-800
Focus rings: emerald-500

/* ❌ WRONG: Any other color palettes */
blue-600, slate-900, gray-500, red-500 (except for error states)
```

### Typography
- **MUST use Tailwind typography classes only**
- **Headings**: `text-emerald-900`, `font-semibold` or `font-bold`
- **Body text**: `text-emerald-800`
- **Muted text**: `text-emerald-600`

### Spacing & Layout
- **MUST use Tailwind spacing scale** (4px increments)
- **Common spacing**: `p-4`, `m-6`, `gap-4`, `space-y-6`
- **Container max-width**: `max-w-7xl mx-auto`

### Navigation Hierarchy
**MUST follow this specific navigation structure:**
```
Farm Name > Bloc Name > Information/Field Operations
```

### View Options for Operations
**MUST implement 3 view types:**
1. **Table View** - TanStack Table with ShadCN styling
2. **Cards View** - ShadCN Card components in grid
3. **Rows View** - Compact list format

### Perspectives for Operations
**MUST implement 3 perspectives:**
1. **Operations Perspective** - Focus on field activities
2. **Resource Perspective** - Focus on equipment/materials
3. **Financial Perspective** - Focus on costs/revenue

### Animation Patterns
- **Page transitions**: 200ms ease-in-out
- **Hover effects**: 150ms ease-in-out  
- **Loading states**: Skeleton components with pulse animation
- **Micro-interactions**: 100-200ms for buttons, inputs

```typescript
// ✅ CORRECT: Consistent animation timing
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: "easeInOut" }}
>
```

### Component Composition Patterns
```typescript
// ✅ CORRECT: Farm Management component pattern
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function FieldOperationCard({ operation }) {
  return (
    <Card className="border-emerald-200 hover:border-emerald-300 transition-colors">
      <CardHeader className="bg-emerald-50">
        <CardTitle className="text-emerald-900">{operation.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Form Patterns
```typescript
// ✅ CORRECT: Form styling pattern
<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-emerald-900">Field Name</FormLabel>
        <FormControl>
          <Input 
            className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500" 
            {...field} 
          />
        </FormControl>
        <FormMessage className="text-red-600" />
      </FormItem>
    )}
  />
</Form>
```

### Table Patterns
```typescript
// ✅ CORRECT: Table styling with emerald theme
<Table>
  <TableHeader>
    <TableRow className="border-emerald-200">
      <TableHead className="text-emerald-900 font-semibold">Operation</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-emerald-50 border-emerald-100">
      <TableCell className="text-emerald-800">{operation.name}</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Responsive Design
- **Mobile-first approach** with Tailwind breakpoints
- **Breakpoints**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`
- **Navigation**: Collapsible on mobile with ShadCN Sheet component

### Error Handling Patterns
- **Use ShadCN Alert components** for error messages
- **Toast notifications** with Sonner for success/error feedback
- **Form validation** with Zod error messages

### Loading States
- **Use ShadCN Skeleton** components for loading
- **Consistent loading patterns** across all data fetching

### Accessibility
- **MUST use proper ARIA labels** on all interactive elements
- **MUST maintain color contrast** with emerald palette
- **MUST support keyboard navigation**

This ensures consistent, modern UX patterns throughout the Farm Management application.
