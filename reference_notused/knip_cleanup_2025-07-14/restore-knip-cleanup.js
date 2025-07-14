#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management';
const sessionDir = 'C:\Users\gdeswardt\Documents\augment-projects\00 Scanne\Farm Management\reference_notused\knip_cleanup_2025-07-14';

const movedFiles = [
  {
    "originalPath": "src/components/ConfigurationHealthCheck.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ConfigurationHealthCheck.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.642Z"
  },
  {
    "originalPath": "src/components/DateInput.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\DateInput.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.646Z"
  },
  {
    "originalPath": "src/components/Header.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\Header.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.647Z"
  },
  {
    "originalPath": "src/components/ProductForm.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ProductForm.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.649Z"
  },
  {
    "originalPath": "src/components/SVGOverlay.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\SVGOverlay.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.650Z"
  },
  {
    "originalPath": "src/data/overviewSampleData.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\data\\overviewSampleData.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.653Z"
  },
  {
    "originalPath": "src/hooks/use-toast.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\hooks\\use-toast.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.654Z"
  },
  {
    "originalPath": "src/schemas/cropCycleSchema.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\schemas\\cropCycleSchema.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.656Z"
  },
  {
    "originalPath": "src/services/attachmentService.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\services\\attachmentService.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.657Z"
  },
  {
    "originalPath": "src/types/database.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\types\\database.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.660Z"
  },
  {
    "originalPath": "src/utils/csvParser.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\utils\\csvParser.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.662Z"
  },
  {
    "originalPath": "src/utils/uuidHelpers.ts",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\utils\\uuidHelpers.ts",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.663Z"
  },
  {
    "originalPath": "src/components/navigation/ModernNavigation.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\navigation\\ModernNavigation.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.665Z"
  },
  {
    "originalPath": "src/components/ui/dialog.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\dialog.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.666Z"
  },
  {
    "originalPath": "src/components/ui/dropdown-menu.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\dropdown-menu.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.667Z"
  },
  {
    "originalPath": "src/components/ui/navigation-menu.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\navigation-menu.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.669Z"
  },
  {
    "originalPath": "src/components/ui/sheet.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\sheet.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.671Z"
  },
  {
    "originalPath": "src/components/ui/toast.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\toast.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.672Z"
  },
  {
    "originalPath": "src/components/ui/toaster.tsx",
    "backupPath": "reference_notused\\knip_cleanup_2025-07-14\\src\\components\\ui\\toaster.tsx",
    "reason": "Knip unused file",
    "timestamp": "2025-07-14T03:21:21.673Z"
  }
];

console.log('🔄 Restoring files from Knip cleanup session...');

let restored = 0;
let failed = 0;

for (const file of movedFiles) {
  const backupPath = path.join(sessionDir, file.originalPath);
  const originalPath = path.join(projectRoot, file.originalPath);
  
  try {
    const originalDir = path.dirname(originalPath);
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    
    fs.renameSync(backupPath, originalPath);
    console.log(`✅ Restored: ${file.originalPath}`);
    restored++;
  } catch (error) {
    console.error(`❌ Failed to restore ${file.originalPath}:`, error.message);
    failed++;
  }
}

console.log(`\n📊 Restoration complete: ${restored} restored, ${failed} failed`);
