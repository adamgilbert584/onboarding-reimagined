# 📦 Download and Deploy Edge Functions

Since I cannot create a ZIP file directly, here are your options to get the edge functions onto your Mac:

---

## Option 1: Clone from GitHub (Recommended)

If this project is connected to GitHub:

```bash
# On your Mac
git clone YOUR_GITHUB_REPO_URL
cd onboarding-reimagined
```

All edge functions will be in `supabase/functions/`

---

## Option 2: Download from Cloud IDE

If you're working in a cloud IDE (like Lovable, Replit, etc.):

1. **Right-click** on the `supabase` folder in the file explorer
2. Select **"Download"** or **"Export"**
3. Save to your Mac
4. Extract if compressed

---

## Option 3: Manual Copy-Paste

If you need to manually recreate the files on your Mac:

### Step 1: Create Directory Structure

```bash
# On your Mac terminal
cd ~/Desktop  # or wherever you want the project
mkdir -p supabase/functions/_shared
mkdir -p supabase/functions/admin-login
mkdir -p supabase/functions/get-branding
mkdir -p supabase/functions/update-branding
mkdir -p supabase/functions/upload-file
mkdir -p supabase/functions/create-veriff-session
mkdir -p supabase/functions/get-verifications
mkdir -p supabase/functions/veriff-webhook
```

### Step 2: Copy File Contents

Open each file below and copy its contents to your Mac:

#### 1. `supabase/functions/_shared/cors.ts`
Copy from: `/agentic/workspaces/default/projects/onboarding-reimagined/supabase/functions/_shared/cors.ts`

#### 2. `supabase/functions/_shared/jwt.ts`
Copy from: `/agentic/workspaces/default/projects/onboarding-reimagined/supabase/functions/_shared/jwt.ts`

#### 3-9. Each function's `index.ts`
Copy each from their respective paths:
- `supabase/functions/admin-login/index.ts`
- `supabase/functions/get-branding/index.ts`
- `supabase/functions/update-branding/index.ts`
- `supabase/functions/upload-file/index.ts`
- `supabase/functions/create-veriff-session/index.ts`
- `supabase/functions/get-verifications/index.ts`
- `supabase/functions/veriff-webhook/index.ts`

---

## Option 4: Use the Deployment Script

I've created `deploy-functions.sh` which will deploy directly from wherever the files are located.

---

## After Getting the Files on Your Mac

### 1. Install Supabase CLI (if not installed)

```bash
brew install supabase/tap/supabase
```

### 2. Navigate to Project

```bash
cd path/to/your/project
```

### 3. Login to Supabase

```bash
supabase login
```

### 4. Link to Your Project

```bash
supabase link --project-ref hljygcylzbqtswemeffe
```

### 5. Deploy All Functions

```bash
supabase functions deploy admin-login
supabase functions deploy get-branding
supabase functions deploy update-branding
supabase functions deploy upload-file
supabase functions deploy create-veriff-session
supabase functions deploy get-verifications
supabase functions deploy veriff-webhook
```

**Or use the automated script:**

```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```

---

## File Structure Verification

After copying, your structure should look like:

```
your-project/
└── supabase/
    └── functions/
        ├── _shared/
        │   ├── cors.ts
        │   └── jwt.ts
        ├── admin-login/
        │   └── index.ts
        ├── get-branding/
        │   └── index.ts
        ├── update-branding/
        │   └── index.ts
        ├── upload-file/
        │   └── index.ts
        ├── create-veriff-session/
        │   └── index.ts
        ├── get-verifications/
        │   └── index.ts
        └── veriff-webhook/
            └── index.ts
```

Verify with:
```bash
find supabase/functions -name "*.ts" -type f
```

Expected output:
```
supabase/functions/_shared/cors.ts
supabase/functions/_shared/jwt.ts
supabase/functions/admin-login/index.ts
supabase/functions/get-branding/index.ts
supabase/functions/update-branding/index.ts
supabase/functions/upload-file/index.ts
supabase/functions/create-veriff-session/index.ts
supabase/functions/get-verifications/index.ts
supabase/functions/veriff-webhook/index.ts
```

---

## Quick Deployment Checklist

- [ ] Files on Mac in correct structure
- [ ] Supabase CLI installed (`brew install supabase/tap/supabase`)
- [ ] Logged in (`supabase login`)
- [ ] Linked to project (`supabase link --project-ref hljygcylzbqtswemeffe`)
- [ ] Deploy 7 functions (use script or manual commands)
- [ ] Verify deployment in Supabase Dashboard → Edge Functions

---

## Your Secrets (Add to Supabase After Deploy)

```
ADMIN_PASSWORD: Veriff#1
JWT_SECRET: b8f4e2d9a7c3f1e6d4b2a8f5e3d1c9b7f6e4d2a9c8f7e5d3b1a6f4e2d9c7b5a3
VERIFF_API_KEY: c59bb395-ae20-4505-84e9-4483d191b29e
VERIFF_API_SECRET: 9cbb655d-f7c3-44d0-9b69-7c6a9fa63988
```

Add these in: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

---

## Troubleshooting

**Problem:** Can't find files
- Make sure you're in the correct directory
- Check if project is cloned/downloaded correctly

**Problem:** Supabase CLI not found
- Install with: `brew install supabase/tap/supabase`
- Restart terminal after install

**Problem:** Not linked to project
- Run: `supabase link --project-ref hljygcylzbqtswemeffe`
- Verify with: `supabase status`

**Problem:** Deploy fails
- Check internet connection
- Verify you're logged in: `supabase projects list`
- Check function logs in Supabase Dashboard

---

## Next Steps After Deployment

1. ✅ Verify all 7 functions deployed in Supabase Dashboard
2. ✅ Add 4 secrets to Supabase
3. ✅ Run database SQL (see DEPLOYMENT_INSTRUCTIONS.md)
4. ✅ Create storage buckets
5. ✅ Configure Veriff webhook
6. ✅ Test admin login
7. ✅ Test verification flow

---

**All files are ready in this project! Choose the option that works best for you to get them onto your Mac.** 🚀
