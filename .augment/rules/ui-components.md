---
type: "always_apply"
---

# UI Components Rules (Always)

**Rule Type**: Always
**Description**: Mandatory ShadCN UI CLI usage for all UI components in Farm Management project

## 🚨 MANDATORY: ShadCN UI CLI Only

**ALL UI components MUST be created using ShadCN UI CLI - NO EXCEPTIONS**

### Required Commands:
```bash
# Check existing components first
ls src/components/ui/

# Add new components via CLI only
npx shadcn@latest add [component-name]
```

### Current Project Configuration:
- **Style**: New York
- **Base Color**: Emerald (configured in components.json)
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

### Available ShadCN Components (Use CLI):
```bash
npx shadcn@latest add accordion
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add breadcrumb
npx shadcn@latest add button
npx shadcn@latest add calendar
npx shadcn@latest add card
npx shadcn@latest add carousel
npx shadcn@latest add chart
npx shadcn@latest add checkbox
npx shadcn@latest add collapsible
npx shadcn@latest add command
npx shadcn@latest add context-menu
npx shadcn@latest add dialog
npx shadcn@latest add drawer
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add hover-card
npx shadcn@latest add input
npx shadcn@latest add input-otp
npx shadcn@latest add label
npx shadcn@latest add menubar
npx shadcn@latest add navigation-menu
npx shadcn@latest add pagination
npx shadcn@latest add popover
npx shadcn@latest add progress
npx shadcn@latest add radio-group
npx shadcn@latest add resizable
npx shadcn@latest add scroll-area
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add slider
npx shadcn@latest add sonner
npx shadcn@latest add switch
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add toast
npx shadcn@latest add toggle
npx shadcn@latest add toggle-group
npx shadcn@latest add tooltip
```

### Already Installed Components:
- Badge, Breadcrumb, Button, Card, Form, Input, Label, Progress
- Select, Separator, Sheet, Table, Tabs, Textarea

### Custom Component Extension Pattern:
```typescript
// ✅ CORRECT: Extend ShadCN components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CustomFarmButton({ children, ...props }) {
  return (
    <Button className="bg-emerald-600 hover:bg-emerald-700" {...props}>
      {children}
    </Button>
  )
}

// ❌ WRONG: Manual component creation
export function CustomButton() {
  return <div className="button-like">...</div>
}
```

### Exception Cases Only:
2. **GIS/Map components** - preserve existing FarmGIS CSS
3. **Data visualization** - use Recharts with ShadCN Chart component

### Workflow Enforcement:
1. **Before any UI work**: Check if ShadCN provides the component
2. **If ShadCN has it**: Use `npx shadcn@latest add [component-name]`
3. **If customization needed**: Extend the ShadCN component
4. **Never manually create** standard UI elements

### Documentation:
- [ShadCN UI Components](https://ui.shadcn.com/docs/components)
- [ShadCN CLI Reference](https://ui.shadcn.com/docs/cli)

**CRITICAL**: Always verify component existence in `src/components/ui/` before suggesting manual creation.
