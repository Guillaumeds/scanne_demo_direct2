---
type: "always_apply"
---

# File Management Rules (Manual)

**Rule Type**: Manual
**Description**: File organization, development workflow, and project structure rules

## 📁 File Organization

### Development Files Location
**ALL non-app contributing files MUST be placed in:**
```
TEMP DEV FOLDER/
├── scripts/
├── tests/
├── analysis/
└── temp-components/
```

**Examples of files that go in TEMP DEV FOLDER:**
- Scripts for data import/export
- Test files for development
- Temporary analysis files
- Development utilities
- Non-production components

### Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # ShadCN UI components (CLI generated)
│   ├── farm/              # Farm-specific business components
│   ├── gis/               # GIS/Map components (preserve existing)
│   └── layout/            # Layout components
├── lib/
│   ├── utils.ts           # ShadCN utilities (cn function)
│   ├── api.ts             # API utilities
│   └── validations.ts     # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/               # Global styles (minimal)
```

### Component Organization Rules
- **Eliminate duplicate components** with Modern/normal prefixes
- **Maintain only one comprehensive version** of each component
- **Keep codebase concise** and avoid confusion
- **Use descriptive, consistent naming** conventions

### Naming Conventions
```typescript
// ✅ CORRECT: Component naming
FieldOperationCard.tsx
CropCycleSelector.tsx
FarmDashboard.tsx

// ✅ CORRECT: Hook naming
useFieldOperations.ts
useCropCycles.ts
useFarmData.ts

// ✅ CORRECT: Utility naming
fieldOperationUtils.ts
cropCycleValidations.ts
farmDataTransforms.ts
```

### Import Organization
```typescript
// ✅ CORRECT: Import order
// 1. React/Next.js imports
import React from "react"
import { NextPage } from "next"

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"

// 3. ShadCN UI components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 4. Custom components
import { FieldOperationCard } from "@/components/farm/FieldOperationCard"

// 5. Utilities and types
import { cn } from "@/lib/utils"
import { FieldOperation } from "@/types/farm"
```

## 🔧 Development Workflow

### Dependency Management
- **ALWAYS use npm** for dependency management
- **NEVER manually edit** package.json for dependencies
- **Verify versions** using npm commands, not assumptions
- **Prioritize latest stable versions** for new development

### Code Quality
- **Use faster TypeScript and ESLint checking** instead of full builds
- **Keep unused exports** for future use
- **Only clean up unused types** when running knip
- **Run type checking**: `npx tsc --noEmit`
- **Run linting**: `npx eslint . --ext .ts,.tsx`

### Git Workflow
- **Create feature branches** for new development
- **Use descriptive commit messages**
- **Test before committing**
- **Force-push when needed** (development environment)

### Documentation Rules
- **Do NOT create user guides** or markdown files without specific user request
- **Focus on code comments** for complex business logic
- **Document API interfaces** with TypeScript types
- **Keep README minimal** and focused

## 🚫 Restrictions

### What NOT to Create
- User guides or extensive documentation (unless requested)
- Duplicate components with different naming
- Custom CSS files (except for GIS components)
- Manual UI components that ShadCN provides
- Multiple versions of the same functionality

### GIS/Map Component Exceptions
- **Preserve existing FarmGIS CSS** separately
- **Keep map-related components** in `src/components/gis/`
- **Maintain existing map functionality** during UI redesign
- **Use separate styling approach** for map components only

### Legacy Component Handling
- **Remove @heroicons/react** dependencies (breaking legacy is OK)
- **Remove date-fns** dependencies (breaking legacy is OK)
- **Remove csv-parse** dependencies (breaking legacy is OK)
- **Focus on modern tech stack** only

## 📋 Maintenance Tasks

### Regular Cleanup
```bash
# Analyze unused files
npm run analyze:unused

# Safe cleanup
npm run cleanup:safe

# Knip-based cleanup
npm run cleanup:knip

# Dependency cleanup
npm run cleanup:deps
```

### Pre-commit Checks
```bash
# Run maintenance check
npm run maintenance:check

# Quick maintenance check
npm run maintenance:quick

# Pre-commit validation
npm run pre-commit:check
```

This ensures organized, maintainable code structure throughout the Farm Management project.
