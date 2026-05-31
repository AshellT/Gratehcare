# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Fixed production start script in package.json
- [x] Added Railway configuration (railway.json)
- [x] Added Nixpacks configuration (nixpacks.toml)
- [x] Server configured to listen on 0.0.0.0
- [x] Production logging added
- [x] Real-time SSE notifications implemented

---

## 📋 Railway Dashboard Steps

### Step 1: Set Root Directory ⚠️ CRITICAL
**This is what caused your previous deployment to fail!**

1. Go to Railway dashboard → Your project
2. Click **"Set root directory"** button (purple button shown in your screenshot)
3. Enter: `backend`
4. Save

### Step 2: Configure Environment Variables

Add these in Railway → Variables tab:

```env
# Core
NODE_ENV=production
PORT=4000

# Database (from Supabase)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=1d

# CORS (your frontend domain)
CORS_ORIGIN=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
SUPABASE_JWT_SECRET=<from-supabase-dashboard>

# Optional
REDIS_URL=redis://...
TEST_ACCOUNT_PASSWORD=0778007350
```

### Step 3: Deploy

1. Push your code to GitHub (if not already done)
2. Railway will automatically detect changes and deploy
3. Watch the build logs

---

## 🔍 Verify Deployment

### 1. Check Build Logs
Look for these success messages:
- ✓ Dependencies installed
- ✓ Prisma client generated
- ✓ NestJS build completed
- ✓ Server started

### 2. Test Endpoints

**Health Check:**
```bash
curl https://your-app.railway.app/api/v1/auth/health
```

**Real-time SSE (with auth token):**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-app.railway.app/api/v1/notifications/stream
```

### 3. Run Database Migrations

In Railway dashboard → your service → Settings → One-off Commands:
```bash
npx prisma migrate deploy
```

Or using Railway CLI:
```bash
railway run npx prisma migrate deploy
```

---

## 🎯 Real-Time Features Ready

Your backend now supports **Server-Sent Events (SSE)** for real-time notifications:

### Endpoint
- **URL**: `GET /api/v1/notifications/stream`
- **Auth**: JWT Bearer token required
- **Type**: Server-Sent Events (SSE)

### Test Real-time
```bash
# 1. Get auth token (login first)
# 2. Connect to SSE stream
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.railway.app/api/v1/notifications/stream

# 3. In another terminal, trigger test notification
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.railway.app/api/v1/notifications/test-push
```

### Frontend Integration
```typescript
// Connect to real-time notifications
const eventSource = new EventSource(
  `${API_URL}/api/v1/notifications/stream`,
  { 
    headers: { 
      Authorization: `Bearer ${accessToken}` 
    } 
  }
);

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Handle real-time notification
  console.log('New notification:', notification);
};
```

---

## 🐛 Troubleshooting

### Build Fails: "No start script"
- **Cause**: Root directory not set to `backend`
- **Fix**: Set root directory in Railway dashboard

### Build Fails: "Prisma generate failed"
- **Cause**: DATABASE_URL not set
- **Fix**: Add DATABASE_URL to environment variables

### Server Crashes on Start
- **Cause**: Missing environment variables
- **Fix**: Verify all required env vars are set

### CORS Errors
- **Cause**: Frontend domain not in CORS_ORIGIN
- **Fix**: Update CORS_ORIGIN to include your frontend URL

### Real-time Not Working
- **Cause**: JWT token expired or invalid
- **Fix**: Refresh auth token and reconnect

---

## 📊 Post-Deployment

### Monitor Your App
- Railway Dashboard → Metrics
- Check CPU, Memory, Network usage
- Monitor error logs

### Seed Test Data (Optional)
```bash
railway run npm run db:seed
```

### Update Frontend
Update your frontend `.env`:
```env
VITE_API_URL=https://your-app.railway.app/api/v1
VITE_SSE_URL=https://your-app.railway.app/api/v1/notifications/stream
```

---

## ✨ Success Indicators

You'll know deployment is successful when:
- ✅ Build completes without errors
- ✅ Server logs show: "🚀 GRATEHCARE Backend running on port..."
- ✅ Health endpoint returns 200 OK
- ✅ SSE stream connects successfully
- ✅ Test notifications appear in real-time

---

## 🔗 Quick Links

- **Railway Docs**: https://docs.railway.app
- **Nixpacks Docs**: https://nixpacks.com
- **SSE Guide**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---

## 📞 Need Help?

Common issues and solutions are in `RAILWAY_DEPLOYMENT.md`
