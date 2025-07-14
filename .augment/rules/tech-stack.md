---
type: "always_apply"
---

# Technology Stack Rules (Always)

**Rule Type**: Always
**Description**: Mandatory technology stack and version requirements for Farm Management project

## Required Technology Stack

### 🎨 Tailwind CSS (v4.1.11+)
- **MUST use Tailwind classes** for all styling
- **MUST use Emerald color palette**: `emerald-50` to `emerald-950`
- **AVOID custom CSS** except for GIS/map components
- **Use responsive breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

```css
/* ✅ CORRECT: Emerald palette usage */
bg-emerald-600 text-emerald-50 border-emerald-200
hover:bg-emerald-700 focus:ring-emerald-500

/* ❌ WRONG: Other color palettes */
bg-blue-600 text-slate-900
```

### 📊 TanStack Table (v8.21.3+)
- **MUST use** for all data tables and grids
- **MUST integrate** with ShadCN Table component for styling
- **MUST implement**: sorting, filtering, pagination, column resizing
- **MUST provide**: table/cards/rows view options

```typescript
// ✅ CORRECT: TanStack Table with ShadCN styling
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
```

### 🎬 Motion.dev (v12.35.3+)
- **MUST use Motion.dev** (NOT Framer Motion)
- **MUST use** for page transitions and micro-interactions
- **Animation timing**: 200-300ms for consistency

```typescript
// ✅ CORRECT: Motion.dev usage
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### 📝 React Hook Form (v7.60.0+) + Zod (v4.0.5)
- **MUST use React Hook Form** for all forms
- **MUST integrate with Zod** for validation
- **MUST use ShadCN Form components**

```typescript
// ✅ CORRECT: React Hook Form + Zod + ShadCN
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  fieldName: z.string().min(1, "Field name is required"),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

### 🔄 TanStack Query (v5.83.0+)
- **MUST use** for all API calls and data fetching
- **MUST implement**: proper caching, error handling, loading states

```typescript
// ✅ CORRECT: TanStack Query usage
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const { data, isLoading, error } = useQuery({
  queryKey: ['field-operations', fieldId],
  queryFn: () => fetchFieldOperations(fieldId),
})
```

### 📈 Recharts (v3.1.0+)
- **MUST use** for all charts and data visualization
- **MUST use Emerald color palette** for chart theming
- **MUST integrate** with ShadCN Chart component when available

```typescript
// ✅ CORRECT: Recharts with Emerald theming
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

<ResponsiveContainer>
  <BarChart data={data}>
    <Bar dataKey="value" fill="#059669" /> {/* emerald-600 */}
  </BarChart>
</ResponsiveContainer>
```

### ⚛️ Next.js (v15.3.5) + React (v19.1.0)
- **MUST use Next.js App Router**
- **MUST use Server Components** where appropriate
- **MUST use TypeScript** for all components

### 🎯 Integration Requirements:
1. **Forms**: React Hook Form + Zod + ShadCN Form components
2. **Tables**: TanStack Table + TanStack Query + ShadCN Table styling  
3. **Charts**: Recharts + ShadCN Chart + Emerald theming
4. **Animations**: Motion.dev + ShadCN components
5. **Data Flow**: TanStack Query → Zod validation → React Hook Form → ShadCN UI

### Package Management:
- **ALWAYS use npm** for dependency management
- **NEVER manually edit** package.json for dependencies
- **Verify versions** using npm commands

### Documentation Links:
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [Motion.dev](https://motion.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/)
- [Next.js](https://nextjs.org/docs)
