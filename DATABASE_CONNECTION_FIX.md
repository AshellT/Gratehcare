# Database Connection Fix

## Problem
Backend can't connect to Supabase database at `aws-0-eu-west-1.pooler.supabase.com:6543`

Error: `PrismaClientInitializationError: Can't reach database server`

## Solutions

### Option 1: Install Local PostgreSQL (Recommended)

1. **Install PostgreSQL locally:**
   ```bash
   # Download from: https://www.postgresql.org/download/windows/
   # Or use chocolatey:
   choco install postgresql
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gratehcare"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/gratehcare"
   ```

3. **Create the database:**
   ```bash
   # Open psql or pgAdmin
   CREATE DATABASE gratehcare;
   ```

4. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Option 2: Check Network/Firewall

Your firewall or antivirus might be blocking the connection to Supabase.

1. **Temporarily disable firewall:**
   - Windows Defender Firewall → Turn off (temporarily)
   - Try running backend again

2. **Add firewall rule:**
   ```powershell
   New-NetFirewallRule -DisplayName "Supabase" -Direction Outbound -RemoteAddress aws-0-eu-west-1.pooler.supabase.com -Action Allow
   ```

3. **Check VPN/Proxy:**
   - Disable any VPN or proxy
   - Try again

### Option 3: Use Supabase Direct Connection (Not Pooler)

The pooler might be blocked. Try the direct connection:

1. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres.qijhaslgckubaieigmbv:8BOPdGKDCQwrffQX@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://postgres.qijhaslgckubaieigmbv:8BOPdGKDCQwrffQX@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

2. **Restart backend:**
   ```bash
   npm run start:dev
   ```

### Option 4: Test Frontend Without Backend

The frontend now has proper loading states and will show empty data gracefully:

1. **Just run frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **You'll see:**
   - Loading states
   - Empty state messages
   - "Failed to load" errors with toast notifications
   - No fake/mock data displayed

## Recommended Approach

**For local development, use Option 1 (Local PostgreSQL):**

1. Install PostgreSQL locally
2. Update `.env` to use `localhost:5432`
3. Run `npx prisma migrate dev`
4. Start backend: `npm run start:dev`
5. Start frontend: `npm run dev`

This gives you full control and doesn't depend on network connectivity.

## Current Status

✅ **All mock data removed from frontend**
✅ **Frontend shows loading/empty states properly**
✅ **Backend code is ready**
❌ **Database connection blocked by network**

## Next Steps

Choose one of the options above to fix the database connection, then:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3001` and test the platform owner dashboard pages!
