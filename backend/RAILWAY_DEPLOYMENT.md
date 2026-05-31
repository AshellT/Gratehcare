# Railway Deployment Guide - GRATEHCARE Backend

## ✅ Deployment Status

The backend is now **ready for Railway deployment** with the following configurations:

### Fixed Issues
1. ✅ **Production start script** - Changed from `nest start` to `node dist/main`
2. ✅ **Railway configuration** - Added `railway.json` and `nixpacks.toml`
3. ✅ **Server binding** - Configured to listen on `0.0.0.0` for Railway
4. ✅ **Build process** - Includes Prisma generation in build phase

---

## 🚀 Real-Time Functionality

### Server-Sent Events (SSE) Implementation
The backend has **real-time notifications** via SSE:

- **Endpoint**: `GET /api/v1/notifications/stream`
- **Authentication**: JWT required
- **Technology**: RxJS Observables with tenant-scoped filtering
- **Test Endpoint**: `GET /api/v1/notifications/test-push`

### How It Works
```typescript
// Client connects to SSE stream
const eventSource = new EventSource('/api/v1/notifications/stream', {
  headers: { Authorization: `Bearer ${token}` }
});

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Real-time notification:', notification);
};
```

### Notification Types
- `shift_update` - Roster changes
- `incident_alert` - Critical incidents
- `missed_visit` - Missed care visits
- `compliance_alert` - Compliance issues
- `message` - New messages
- `general` - General notifications

---

## 🔧 Railway Deployment Steps

### 1. Set Root Directory
In Railway dashboard:
- Click **"Set root directory"** button
- Enter: `backend`
- This ensures Railway builds from the correct subdirectory

### 2. Environment Variables
Configure these in Railway dashboard → Variables:

**Required:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend-domain.com
```

**Supabase (Required):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

**Optional:**
```env
REDIS_URL=redis://...
TEST_ACCOUNT_PASSWORD=your-test-password
```

### 3. Build Configuration
Railway will automatically:
1. Install dependencies: `npm ci`
2. Generate Prisma client: `npx prisma generate`
3. Build NestJS: `npm run build`
4. Start server: `npm run start:prod`

### 4. Database Migrations
After first deployment, run migrations:
```bash
railway run npx prisma migrate deploy
```

Or use Railway's one-time command feature.

---

## 📊 Health Check

Once deployed, verify:

1. **Server Status**: `GET https://your-app.railway.app/api/v1/auth/health`
2. **Real-time SSE**: Connect to `/api/v1/notifications/stream` with valid JWT
3. **Test Notification**: `GET /api/v1/notifications/test-push` (authenticated)

---

## 🔍 Troubleshooting

### Build Fails
- Ensure root directory is set to `backend`
- Check all environment variables are set
- Verify DATABASE_URL is accessible from Railway

### Server Won't Start
- Check Railway logs for errors
- Verify PORT environment variable
- Ensure Prisma client is generated

### Real-time Not Working
- Verify CORS_ORIGIN includes your frontend domain
- Check JWT token is valid
- Test with `/api/v1/notifications/test-push` endpoint

---

## 📝 Post-Deployment

1. **Seed Database** (optional):
   ```bash
   railway run npm run db:seed
   ```

2. **Monitor Logs**:
   - Railway dashboard → Deployments → View logs
   - Look for: "🚀 GRATEHCARE Backend running on port..."

3. **Update Frontend**:
   - Update API base URL to Railway domain
   - Configure SSE endpoint for real-time notifications

---

## 🎯 Production Checklist

- [x] Production start script configured
- [x] Railway configuration files created
- [x] Server listens on 0.0.0.0
- [x] Prisma generation in build phase
- [x] Real-time SSE implemented
- [ ] Environment variables set in Railway
- [ ] Root directory set to "backend"
- [ ] Database migrations deployed
- [ ] Frontend connected to Railway backend
- [ ] SSL/HTTPS enabled (automatic on Railway)

---

## 🔗 Next Steps

1. **Deploy to Railway**:
   - Push code to GitHub
   - Set root directory to `backend` in Railway dashboard
   - Configure environment variables
   - Deploy

2. **Test Real-time**:
   - Connect frontend to SSE endpoint
   - Trigger test notification
   - Verify real-time updates work

3. **Monitor**:
   - Check Railway metrics
   - Monitor error logs
   - Set up alerts for downtime
