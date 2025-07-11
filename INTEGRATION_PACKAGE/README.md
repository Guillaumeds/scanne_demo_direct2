# Agricultural Nested Table Component - Integration Package

This package contains everything you need to integrate the advanced nested table component into your Node.js React project.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material material-react-table
```

### 2. Copy Files

Copy these files to your project:
- `components/NestedTableApproach.tsx` - Main component
- `types/TableTypes.ts` - TypeScript interfaces
- `data/sampleData.ts` - Sample data structure

### 3. Basic Usage

```tsx
import React from 'react';
import { NestedTableApproach } from './components/NestedTableApproach';

function App() {
  return (
    <div>
      <NestedTableApproach />
    </div>
  );
}

export default App;
```

## 📦 Dependencies Required

```json
{
  "@mui/material": "^5.14.20",
  "@emotion/react": "^11.11.1", 
  "@emotion/styled": "^11.11.0",
  "@mui/icons-material": "^5.14.19",
  "material-react-table": "^2.8.0",
  "react": "^18.2.0",
  "typescript": "^4.9.5"
}
```

## 🎨 Features Included

✅ **3-Level Nested Tables**: Bloc → Product → Work Package
✅ **Full CRUD Operations**: Add/Delete at all levels
✅ **Color-Coded Hierarchy**: Blue → Green → White/Grey
✅ **Enhanced Empty States**: Intuitive add buttons
✅ **Editable Cells**: Single-click editing
✅ **Progress Bars**: Visual progress indicators
✅ **Responsive Design**: Works on all screen sizes
✅ **TypeScript Support**: Full type safety

## 🔧 Customization

### Data Structure
The component expects data in this format:
```typescript
interface BlocNode {
  id: string;
  name: string;
  area_hectares: number;
  // ... see TableTypes.ts for full interface
}
```

### Styling
Colors can be customized by modifying the MUI theme colors:
- `primary` - Bloc level (Blue)
- `success` - Product level (Green) 
- `grey` - Work Package level (White/Grey)

## 📁 File Structure

```
your-project/
├── src/
│   ├── components/
│   │   └── NestedTableApproach.tsx
│   ├── types/
│   │   └── TableTypes.ts
│   └── data/
│       └── sampleData.ts
```

## 🎯 Next Steps

1. Install dependencies
2. Copy component files
3. Import and use in your app
4. Customize data structure for your needs
5. Modify styling/colors as needed

## 💡 Tips

- The component is fully self-contained
- No external CSS files required
- Works with any MUI theme
- Easily customizable for different data structures
