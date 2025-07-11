# Installation Guide - Agricultural Nested Table Component

## 🚀 Step-by-Step Integration

### Step 1: Install Dependencies

```bash
# Using npm
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material material-react-table

# Using yarn
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material material-react-table
```

### Step 2: Setup MUI Theme Provider (if not already done)

In your main App.tsx or index.tsx:

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  // Your theme configuration
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Step 3: Copy Files to Your Project

```
your-project/
├── src/
│   ├── components/
│   │   └── NestedTableApproach.tsx    ← Copy this
│   ├── types/
│   │   └── TableTypes.ts              ← Copy this
│   └── data/
│       └── sampleData.ts              ← Copy this (optional)
```

### Step 4: Import and Use

```tsx
import React from 'react';
import { NestedTableApproach } from './components/NestedTableApproach';

function MyPage() {
  return (
    <div>
      <h1>My Agricultural Dashboard</h1>
      <NestedTableApproach />
    </div>
  );
}
```

## 🔧 Configuration Options

### Props Interface

```tsx
interface NestedTableApproachProps {
  initialData?: BlocNode[];           // Starting data
  onDataChange?: (data: BlocNode[]) => void;  // Callback when data changes
  readOnly?: boolean;                 // Disable editing
  showSummary?: boolean;              // Show summary card
}
```

### Usage Examples

```tsx
// Basic usage with sample data
<NestedTableApproach />

// With your own data
<NestedTableApproach 
  initialData={myData}
  onDataChange={(newData) => saveToBackend(newData)}
/>

// Read-only mode
<NestedTableApproach 
  initialData={myData}
  readOnly={true}
/>

// Without summary
<NestedTableApproach 
  showSummary={false}
/>
```

## 🎨 Customization

### Colors
The component uses MUI theme colors:
- `primary` - Bloc level (Blue)
- `success` - Product level (Green)
- `grey` - Work Package level (White/Grey)

### Data Structure
Modify the interfaces in `TableTypes.ts` to match your data structure.

### Product Options
Edit `sampleData.ts` to change the dropdown options:

```tsx
export const productOptions = [
  'Your Custom Option 1',
  'Your Custom Option 2',
  // ...
];
```

## 🐛 Troubleshooting

### Common Issues

1. **MUI Theme Not Found**
   - Ensure ThemeProvider wraps your app
   - Install @mui/material correctly

2. **TypeScript Errors**
   - Check that all interfaces match your data
   - Ensure TypeScript version is 4.9+

3. **Styling Issues**
   - Verify emotion packages are installed
   - Check for CSS conflicts

### Next.js Setup

If using Next.js, add to `next.config.js`:

```js
module.exports = {
  transpilePackages: ['@mui/material', '@mui/icons-material'],
}
```

## 📞 Support

If you encounter issues:
1. Check the examples folder
2. Verify all dependencies are installed
3. Ensure MUI theme is properly configured
4. Check browser console for errors
