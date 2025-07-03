# Supabase CLI Setup Guide

## 🚀 **Local Development with Supabase CLI**

This guide sets up a complete local development environment with Supabase CLI, which is much better than using the web dashboard for development.

## 📋 **Prerequisites**

- Docker Desktop installed and running
- Node.js 18+ installed
- Git installed

## 🔧 **Setup Steps**

### **Step 1: Install Supabase CLI**

```bash
# Install globally (recommended)
npm install -g supabase

# Or install locally (already done)
npm install --save-dev supabase
```

### **Step 2: Start Local Supabase**

```bash
# Start all Supabase services locally
npm run supabase:start

# This will start:
# - PostgreSQL database (port 54322)
# - API server (port 54321) 
# - Studio dashboard (port 54323)
# - Auth server
# - Storage server
# - Realtime server
```

**First run will take 2-3 minutes to download Docker images.**

### **Step 3: Access Local Services**

Once started, you'll have access to:

- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323 (Database dashboard)
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### **Step 4: Run Database Migrations**

```bash
# Apply all migrations (creates tables, indexes, triggers)
npm run supabase:migrate

# Or reset database with fresh schema and seed data
npm run supabase:reset
```

### **Step 5: Generate TypeScript Types**

```bash
# Generate types from your database schema
npm run supabase:types
```

This creates `src/types/supabase.ts` with exact database types.

### **Step 6: Start Your Next.js App**

```bash
# Start development server
npm run dev
```

Your app will connect to the local Supabase instance automatically.

## 🎯 **Available Commands**

```bash
# Start local Supabase
npm run supabase:start

# Stop local Supabase  
npm run supabase:stop

# Reset database (fresh schema + seed data)
npm run supabase:reset

# Push migrations to database
npm run supabase:migrate

# Generate TypeScript types
npm run supabase:types

# Seed database with sample data
npm run db:seed
```

## 📊 **Database Management**

### **Access Studio Dashboard**
- Open http://127.0.0.1:54323
- Browse tables, run queries, manage data
- No login required for local development

### **Direct Database Access**
```bash
# Connect with psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Or use any PostgreSQL client
# Host: 127.0.0.1
# Port: 54322
# Database: postgres
# Username: postgres
# Password: postgres
```

## 🔄 **Development Workflow**

### **1. Make Schema Changes**
- Edit files in `supabase/migrations/`
- Run `npm run supabase:migrate` to apply changes

### **2. Update Types**
- Run `npm run supabase:types` after schema changes
- Import updated types in your code

### **3. Test with Fresh Data**
- Run `npm run supabase:reset` for clean slate
- Applies all migrations + seed data

### **4. Real-time Development**
- Changes to migrations are applied instantly
- No need to restart services
- Hot reload works with Next.js

## 🌐 **Production Deployment**

### **Link to Production Project**
```bash
# Link to your production Supabase project
supabase link --project-ref your-project-id

# Push local migrations to production
supabase db push
```

### **Environment Variables**
For production, update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🛠️ **Troubleshooting**

### **Docker Issues**
```bash
# If services won't start
docker system prune -a
npm run supabase:stop
npm run supabase:start
```

### **Port Conflicts**
```bash
# Check what's using ports
netstat -an | findstr :54321
netstat -an | findstr :54322
netstat -an | findstr :54323

# Kill conflicting processes or change ports in supabase/config.toml
```

### **Database Connection Issues**
```bash
# Reset everything
npm run supabase:stop
docker system prune -a
npm run supabase:start
```

## ✅ **Verification Steps**

1. **Check services are running:**
   ```bash
   supabase status
   ```

2. **Test database connection:**
   - Open http://127.0.0.1:54323
   - Should see Supabase Studio with your tables

3. **Test API connection:**
   - Open http://127.0.0.1:54321/rest/v1/companies
   - Should return JSON (might be empty initially)

4. **Test Next.js connection:**
   - Start your app with `npm run dev`
   - Check browser console for connection errors

## 🎉 **Benefits of CLI Approach**

✅ **Local Development**: No internet required
✅ **Version Control**: All schema changes tracked in git
✅ **Type Safety**: Auto-generated TypeScript types
✅ **Fast Iteration**: Instant schema changes
✅ **Team Collaboration**: Shared migrations
✅ **Production Parity**: Same environment locally and in production

## 📚 **Next Steps**

Once setup is complete:
1. **Test database connection** with a simple query
2. **Replace localStorage services** with Supabase queries
3. **Implement real-time subscriptions**
4. **Add authentication** when ready

---

**Ready to start?** Run `npm run supabase:start` and let's build! 🚀
