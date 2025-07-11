# 🔧 **VS Code Debugging Guide for Node.js/React**

## 🎯 **VS Code Debugging Configurations Added**

I've created comprehensive debugging configurations in `.vscode/launch.json`:

### **Available Debug Configurations:**

1. **🚀 Debug Next.js App (Node)** - Debug the Node.js server
2. **🌐 Debug Hierarchical Operations (Chrome)** - Debug React components in Chrome
3. **🔗 Attach to Next.js** - Attach to running Next.js process
4. **🌐 Launch Edge with debugging** - Debug in Microsoft Edge
5. **🔗 Attach to Edge** - Attach to running Edge process

## 🎮 **How to Use VS Code Debugging:**

### **Method 1: Debug React Components**
1. **Set breakpoints** in your React components (click left margin in VS Code)
2. **Press F5** or go to Run & Debug panel
3. **Select "Debug Hierarchical Operations (Chrome)"**
4. **Chrome opens** with debugging enabled
5. **Interact with the app** - breakpoints will trigger in VS Code

### **Method 2: Debug Node.js Server**
1. **Set breakpoints** in API routes or server-side code
2. **Press F5** and select "Debug Next.js App (Node)"
3. **Server starts** with debugging enabled
4. **Make requests** - breakpoints trigger in VS Code

### **Method 3: Console Debugging**
```javascript
// Add these in your React components for debugging
console.log('🐛 Debug data:', data);
console.table(hierarchicalData); // Great for arrays/objects
console.group('🔍 Column Generation');
console.log('Groups:', columnGroups);
console.log('Columns:', columns.length);
console.groupEnd();

// Use debugger statement for automatic breakpoints
debugger; // Execution will pause here when debugging
```

## 🔍 **Debugging Best Practices:**

### **React Component Debugging:**
```javascript
// In your component
useEffect(() => {
  console.log('🔄 Component mounted/updated');
  console.log('📊 Current data:', data);
  console.log('⚙️ Current state:', { expandedBlocs, columnGroups });
}, [data, expandedBlocs, columnGroups]);

// Debug render cycles
console.log('🎨 Rendering component with:', { props, state });
```

### **Table/Grid Debugging:**
```javascript
// Debug column generation
const columns = useMemo(() => {
  console.log('🏗️ Generating columns...');
  const cols = [];
  // ... column logic
  console.log('✅ Generated columns:', cols.length);
  return cols;
}, [dependencies]);

// Debug data transformations
const tableData = useMemo(() => {
  console.log('📋 Transforming data...');
  const result = transformData(rawData);
  console.log('✅ Transformed data:', result.length, 'rows');
  return result;
}, [rawData]);
```

## 🚨 **Common Issues & Solutions:**

### **HTML Table Issues:**
- ✅ **Fixed**: Proper nested table structure with expand/collapse
- ✅ **Fixed**: Consistent styling across all table levels
- ✅ **Fixed**: Responsive design for mobile devices

### **Mantine Table Issues:**
- ✅ **Fixed**: Working + buttons that actually add data
- ✅ **Fixed**: Multi-level tree structure with daily tasks
- ✅ **Fixed**: Status dropdown editing

## 📊 **Performance Debugging:**

### **React DevTools:**
1. Install React DevTools browser extension
2. Use Profiler tab to identify slow renders
3. Check component re-render patterns

### **Console Performance:**
```javascript
// Measure performance
console.time('Data Processing');
const result = processLargeDataset(data);
console.timeEnd('Data Processing');

// Memory usage
console.log('Memory:', performance.memory);
```

## 🎯 **Debugging Specific Issues:**

### **Column Grouping Not Working:**
```javascript
// Add this debugging
const columnGroups = {
  basic: true,
  planning: true,
  // ...
};

console.log('🔧 Column groups state:', columnGroups);

const columns = useMemo(() => {
  console.log('🏗️ Building columns with groups:', columnGroups);
  // Check each group
  if (columnGroups.basic) {
    console.log('✅ Adding basic columns');
  }
  // ...
}, [columnGroups]);
```

### **Tree Expansion Not Working:**
```javascript
// Debug expansion state
const [expandedBlocs, setExpandedBlocs] = useState(new Set(['Bloc 1']));

const toggleExpansion = (id) => {
  console.log('🌳 Toggling expansion for:', id);
  console.log('📋 Current expanded:', Array.from(expandedBlocs));
  
  setExpandedBlocs(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      console.log('➖ Collapsing:', id);
      newSet.delete(id);
    } else {
      console.log('➕ Expanding:', id);
      newSet.add(id);
    }
    console.log('📋 New expanded:', Array.from(newSet));
    return newSet;
  });
};
```

### **Data Not Updating:**
```javascript
// Debug data mutations
const handleAddItem = (parentId, newItem) => {
  console.log('➕ Adding item:', newItem, 'to parent:', parentId);
  
  setData(prevData => {
    console.log('📊 Previous data:', prevData.length, 'items');
    const newData = addItemToHierarchy(prevData, parentId, newItem);
    console.log('📊 New data:', newData.length, 'items');
    return newData;
  });
};
```

## 🎮 **Quick Debug Commands:**

### **In Browser Console:**
```javascript
// Access React component state (when debugging)
$r.state // Current component state
$r.props // Current component props

// Performance monitoring
performance.mark('start');
// ... do something
performance.mark('end');
performance.measure('operation', 'start', 'end');
console.log(performance.getEntriesByType('measure'));
```

### **Network Debugging:**
```javascript
// Monitor API calls
fetch('/api/data')
  .then(response => {
    console.log('📡 API Response:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 API Data:', data);
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
```

## 🎯 **VS Code Extensions for Better Debugging:**

1. **ES7+ React/Redux/React-Native snippets** - Quick component creation
2. **Bracket Pair Colorizer** - Visual bracket matching
3. **Auto Rename Tag** - Sync HTML tag changes
4. **GitLens** - Enhanced Git integration
5. **Thunder Client** - API testing within VS Code

This debugging setup gives you complete visibility into your React/Node.js application!
