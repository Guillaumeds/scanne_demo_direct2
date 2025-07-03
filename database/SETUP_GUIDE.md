# Scanne Database Setup Guide

## 🚀 **Phase 1: Supabase Project Setup**

### **Step 1: Create Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name**: `scanne-farm-management`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Start with Free tier

4. **Wait for project creation** (2-3 minutes)

### **Step 2: Configure Database**

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run the schema creation:**
   - Copy contents of `database/schema.sql`
   - Paste into SQL Editor
   - Click "Run" to create all tables and indexes

3. **Run the seed data:**
   - Copy contents of `database/seed_data.sql`
   - Paste into SQL Editor
   - Click "Run" to populate reference data

### **Step 3: Environment Configuration**

1. **Get your project credentials:**
   - Go to **Settings > API**
   - Copy the **Project URL** and **anon public key**

2. **Create `.env.local` file in your project root:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Add to `.gitignore`:**
```gitignore
.env.local
.env
```

### **Step 4: Install Dependencies**

```bash
npm install @supabase/supabase-js
npm install --save-dev @supabase/cli
```

### **Step 5: Create Supabase Client**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be generated later)
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          // ... other fields
        }
        Insert: {
          // ... insert types
        }
        Update: {
          // ... update types
        }
      }
      // ... other tables
    }
  }
}
```

## 🔧 **Phase 2: Service Layer Migration**

### **Priority 1: Replace CropCycleService**

**File**: `src/services/cropCycleService.ts`

**Replace these methods:**

1. **getAllCropCycles()**
```typescript
// OLD: localStorage
static getAllCropCycles(): CropCycle[] {
  // localStorage logic
}

// NEW: Supabase
static async getAllCropCycles(): Promise<CropCycle[]> {
  const { data, error } = await supabase
    .from('crop_cycles')
    .select(`
      *,
      sugarcane_varieties(name, variety_id),
      intercrop_varieties(name, variety_id),
      blocs(name, area_hectares)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

2. **getBlocSummary()**
```typescript
// NEW: Single database query
static async getBlocSummary(blocId: string): Promise<BlocCycleData> {
  const { data, error } = await supabase
    .from('blocs')
    .select(`
      id,
      status,
      crop_cycles!inner(
        type,
        cycle_number,
        growth_stage,
        days_since_planting,
        sugarcane_planned_harvest_date,
        sugarcane_varieties(name, variety_id),
        intercrop_varieties(name, variety_id)
      )
    `)
    .eq('id', blocId)
    .eq('crop_cycles.status', 'active')
    .single()
  
  if (error || !data) {
    return { blocId, blocStatus: 'active', hasActiveCycle: false }
  }
  
  // Transform data to match interface
  return {
    blocId,
    blocStatus: data.status,
    hasActiveCycle: true,
    // ... map other fields
  }
}
```

### **Priority 2: Create BlocService**

**File**: `src/services/blocService.ts` (new file)

```typescript
import { supabase } from '@/lib/supabase'

export class BlocService {
  static async getBlocWithCropCycle(blocId: string) {
    const { data, error } = await supabase
      .from('blocs')
      .select(`
        *,
        crop_cycles(
          *,
          sugarcane_varieties(name, variety_id),
          intercrop_varieties(name, variety_id)
        )
      `)
      .eq('id', blocId)
      .single()
    
    if (error) throw error
    return data
  }
  
  static async updateBlocStatus(blocId: string, status: 'active' | 'retired') {
    const { error } = await supabase
      .from('blocs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', blocId)
    
    if (error) throw error
  }
}
```

## 📊 **Phase 3: Real-time Features**

### **Enable Real-time Updates**

1. **In Supabase Dashboard:**
   - Go to **Database > Replication**
   - Enable replication for tables: `crop_cycles`, `blocs`

2. **Add real-time subscriptions:**
```typescript
// In your components
useEffect(() => {
  const subscription = supabase
    .channel('crop_cycles_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'crop_cycles' },
      (payload) => {
        // Update local state
        console.log('Crop cycle changed:', payload)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 🔐 **Phase 4: Authentication (Later)**

### **Enable Supabase Auth**

1. **In Supabase Dashboard:**
   - Go to **Authentication > Settings**
   - Configure email/password authentication
   - Set up email templates

2. **Add Row Level Security:**
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
-- ... other tables

-- Create policies
CREATE POLICY "Users can only see their company's data" ON farms
  FOR ALL USING (
    company_id = (
      SELECT primary_company_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );
```

## 🚀 **Deployment to Vercel**

### **Environment Variables**

In Vercel dashboard, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

### **Build Configuration**

Ensure your `next.config.js` includes:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
```

## ✅ **Testing Checklist**

### **Phase 1 Verification**
- [ ] All tables created successfully
- [ ] Seed data populated correctly
- [ ] Supabase client connects without errors
- [ ] Environment variables configured

### **Phase 2 Verification**
- [ ] Bloc cards load data from database
- [ ] Growth stages display correctly
- [ ] Variety information shows properly
- [ ] No localStorage dependencies remain

### **Phase 3 Verification**
- [ ] Real-time updates work
- [ ] Performance is acceptable
- [ ] Error handling works properly
- [ ] Data integrity maintained

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Connection Errors**
   - Check environment variables
   - Verify Supabase project is active
   - Check network connectivity

2. **Permission Errors**
   - Verify RLS policies if enabled
   - Check API key permissions
   - Ensure user authentication if required

3. **Performance Issues**
   - Check query efficiency
   - Verify indexes are created
   - Monitor Supabase dashboard metrics

### **Support Resources**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
