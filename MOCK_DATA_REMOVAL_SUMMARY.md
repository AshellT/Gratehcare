# Mock Data Removal Summary

## Overview
This document identifies all mock/fake data in the platform owner dashboard pages and provides guidance on replacing it with real backend API calls.

## Pages with Mock Data

### 1. TenantsPage.tsx ✅ IN PROGRESS
**Location:** `frontend/src/pages/dashboard/TenantsPage.tsx`

**Mock Data Found:**
- `FALLBACK_TENANTS` constant (lines 24-31) - 6 hardcoded tenant records
- Mock data check: `(res as { _isMock?: boolean })._isMock` (line 63)
- Hardcoded calculations for staff, mrr, health based on index (lines 68-70)
- Hardcoded stats: "18,420" users, "$284,910" MRR, "118%" NRR (lines 142-144)

**Status:** Partially cleaned - FALLBACK_TENANTS removed, need to add loading states

**Next Steps:**
1. Add `loading` state variable
2. Update stats to show "..." during loading and "0" when no data
3. Add empty state message in table
4. Remove mock data detection logic

---

### 2. DocumentsPage.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/DocumentsPage.tsx`

**Mock Data Found:**
- `MOCK_DOCS` constant (lines 36-78) - 4 hardcoded document records
- Mock `uploadFile` function (lines 124-133) - simulates upload with setTimeout

**Required Changes:**
1. Remove `MOCK_DOCS` constant
2. Create real document API endpoints in backend
3. Implement real file upload to backend/storage
4. Add loading states for document list
5. Connect to real backend API

**Backend API Needed:**
```typescript
// backend/src/modules/documents/documents.controller.ts
@Get()
async list() { /* return real documents */ }

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File) { /* handle upload */ }
```

---

### 3. PlatformOwnerHome.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/role-homes/PlatformOwnerHome.tsx`

**Mock Data Found:**
- Hardcoded KPI values (lines 34-37):
  - Tenants: "1,284"
  - MRR: "$284,910"
  - Active users: "18,420"
  - Net retention: "118%"
- Hardcoded MRR trend data (line 46): `[142, 158, 168, ...]`
- Hardcoded alerts (lines 52-56)
- Hardcoded top tenants (lines 78-81)
- Hardcoded activity feed (lines 91-94)

**Required Changes:**
1. Create platform stats API endpoint
2. Fetch real tenant count, MRR, users from backend
3. Calculate real MRR trend from historical data
4. Fetch real alerts from notifications API
5. Fetch real top tenants sorted by usage/revenue
6. Use real audit logs for activity feed

---

### 4. NetworkPage.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/NetworkPage.tsx`

**Mock Data Found:**
- Hardcoded `regions` array (lines 5-11):
  - Australia: 842 tenants, 11,420 users
  - New Zealand: 184 tenants, 2,840 users
  - United Kingdom: 142 tenants, 2,120 users
  - United States: 84 tenants, 1,280 users
  - Canada: 32 tenants, 760 users
- Hardcoded total: "1,284 tenants" (line 57)

**Required Changes:**
1. Group real tenants by region from backend
2. Count users per region from backend
3. Calculate growth from historical data
4. Update total tenant count dynamically

**API Call Needed:**
```typescript
// Fetch tenants grouped by region
const tenants = await tenantsApi.list();
const byRegion = tenants.reduce((acc, t) => {
  const region = t.region || 'Unknown';
  if (!acc[region]) acc[region] = { tenants: 0, users: 0 };
  acc[region].tenants++;
  // Fetch user count per tenant
  return acc;
}, {});
```

---

### 5. RevenuePage.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/RevenuePage.tsx`

**Mock Data Found:**
- Hardcoded MRR trend data (line 10): `[142, 158, 168, 184, ...]`
- Hardcoded stats (lines 23-26):
  - MRR: "$284,910"
  - ARR: "$3.42M"
  - Active tenants: "1,284"
  - Net retention: "118%"
- Hardcoded revenue by plan (lines 67-69)
- Mock cohort retention grid (lines 86-98)

**Required Changes:**
1. Calculate real MRR from tenant subscriptions
2. Calculate ARR (MRR × 12)
3. Get real tenant count
4. Calculate revenue breakdown by plan
5. Implement real cohort analysis

---

### 6. ActivityPage.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/ActivityPage.tsx`

**Mock Data Found:**
- Hardcoded `events` array (lines 6-15) - 8 mock activity events

**Required Changes:**
1. Fetch real audit logs from backend
2. Use existing `/api/v1/audit-logs` endpoint
3. Add pagination
4. Add real-time updates via SSE

**API Call:**
```typescript
import { auditLogsApi } from "@/lib/api/audit-logs";

const logs = await auditLogsApi.list({ limit: 20 });
```

---

### 7. ComplianceSystemPages.tsx ⚠️ NEEDS WORK
**Location:** `frontend/src/pages/dashboard/compliance/ComplianceSystemPages.tsx`

**Mock Data Found:**
- Description text: "audit-ready mock data" (line 338)
- Mock compliance records (need to verify actual data source)

**Required Changes:**
1. Remove "mock data" reference from description
2. Verify compliance data is coming from real backend
3. Update description to: `${filtered.length} records visible`

---

### 8. IntegrationsPage.tsx ✅ ALREADY CONNECTED
**Location:** `frontend/src/pages/dashboard/IntegrationsPage.tsx`

**Status:** Already connected to backend API
- Uses `integrationsApi.list()` for real data
- No mock data found
- Properly implemented with backend integration

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ TenantsPage - Remove FALLBACK_TENANTS (IN PROGRESS)
2. DocumentsPage - Implement real document management
3. PlatformOwnerHome - Connect to real stats API

### Medium Priority (Analytics)
4. NetworkPage - Real regional data
5. RevenuePage - Real revenue calculations
6. ActivityPage - Real audit logs

### Low Priority (Polish)
7. ComplianceSystemPages - Remove mock reference

---

## Backend API Endpoints Needed

### Already Exist ✅
- `/api/v1/organizations` - Tenants CRUD
- `/api/v1/audit-logs` - Activity logs
- `/api/v1/integrations` - Integrations management

### Need to Create ⚠️
- `/api/v1/platform/stats/overview` - Platform-wide statistics
- `/api/v1/platform/stats/network` - Regional breakdown
- `/api/v1/platform/stats/revenue` - Revenue analytics
- `/api/v1/platform/stats/mrr-trend` - MRR historical data
- `/api/v1/documents` - Document management
- `/api/v1/documents/upload` - File upload

---

## Testing Checklist

After removing mock data, test each page:

- [ ] TenantsPage loads real tenants from backend
- [ ] TenantsPage shows loading state
- [ ] TenantsPage shows empty state when no tenants
- [ ] TenantsPage "Add tenant" creates real tenant
- [ ] DocumentsPage loads real documents
- [ ] DocumentsPage uploads files to backend
- [ ] PlatformOwnerHome shows real KPIs
- [ ] NetworkPage shows real regional data
- [ ] RevenuePage calculates real revenue
- [ ] ActivityPage shows real audit logs
- [ ] All pages handle API errors gracefully
- [ ] All pages show loading states

---

## Current Status

**Completed:**
- ✅ Identified all mock data locations
- ✅ Started TenantsPage cleanup (FALLBACK_TENANTS removed)
- ✅ IntegrationsPage already using real data

**In Progress:**
- 🔄 TenantsPage - Need to add loading states and update stats

**Pending:**
- ⏳ Create platform stats backend API
- ⏳ Update remaining 6 pages
- ⏳ Implement document upload functionality
- ⏳ Test all pages with real backend

---

## Next Steps

1. **Complete TenantsPage cleanup:**
   - Add loading state variable
   - Update stats to show loading/real data
   - Add empty state in table
   - Test with backend running

2. **Create platform stats API:**
   - Implement PlatformStatsService
   - Add endpoints for overview, network, revenue
   - Calculate real metrics from database

3. **Update remaining pages one by one:**
   - PlatformOwnerHome
   - NetworkPage
   - RevenuePage
   - ActivityPage
   - DocumentsPage
   - ComplianceSystemPages

4. **End-to-end testing:**
   - Start backend server
   - Start frontend server
   - Test all platform owner pages
   - Verify no mock data is displayed
