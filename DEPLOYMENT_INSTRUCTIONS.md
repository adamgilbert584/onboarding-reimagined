# 🚀 Deployment Instructions

All edge functions have been created! Follow these steps to deploy your Veriff Identity Verification Portal.

---

## ✅ Your Secrets (Ready to Use)

```
ADMIN_PASSWORD: Veriff#1
JWT_SECRET: b8f4e2d9a7c3f1e6d4b2a8f5e3d1c9b7f6e4d2a9c8f7e5d3b1a6f4e2d9c7b5a3
VERIFF_API_KEY: c59bb395-ae20-4505-84e9-4483d191b29e
VERIFF_API_SECRET: 9cbb655d-f7c3-44d0-9b69-7c6a9fa63988
```

---

## 📁 Edge Functions Created

All 7 edge functions are ready in `supabase/functions/`:

1. ✅ `admin-login/index.ts` - Admin authentication with rate limiting
2. ✅ `get-branding/index.ts` - Fetch branding settings (public)
3. ✅ `update-branding/index.ts` - Update branding (admin only)
4. ✅ `upload-file/index.ts` - File uploads to storage (admin only)
5. ✅ `create-veriff-session/index.ts` - Create verification sessions (public)
6. ✅ `get-verifications/index.ts` - Fetch all verifications (admin only)
7. ✅ `veriff-webhook/index.ts` - Handle Veriff decision webhooks

Plus shared utilities in `_shared/`:
- ✅ `cors.ts` - CORS handling
- ✅ `jwt.ts` - JWT token utilities

---

## 🔧 Step 1: Add Secrets to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Project Settings** (⚙️) → **Edge Functions**
4. Scroll to: **Secrets** section
5. Click **"New Secret"** and add each secret:

### Secret #1
```
Name: ADMIN_PASSWORD
Value: Veriff#1
```

### Secret #2
```
Name: JWT_SECRET
Value: b8f4e2d9a7c3f1e6d4b2a8f5e3d1c9b7f6e4d2a9c8f7e5d3b1a6f4e2d9c7b5a3
```

### Secret #3
```
Name: VERIFF_API_KEY
Value: c59bb395-ae20-4505-84e9-4483d191b29e
```

### Secret #4
```
Name: VERIFF_API_SECRET
Value: 9cbb655d-f7c3-44d0-9b69-7c6a9fa63988
```

6. Click **"Add Secret"** for each one
7. Verify all 4 secrets are listed

---

## 🗄️ Step 2: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Create branding_settings table
CREATE TABLE public.branding_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  company_name text NOT NULL DEFAULT 'Your Company',
  logo_url text,
  primary_color text NOT NULL DEFAULT '#1e3a5f',
  secondary_color text NOT NULL DEFAULT '#f8fafc',
  text_color text NOT NULL DEFAULT '#1e293b',
  button_color text NOT NULL DEFAULT '#1e3a5f',
  button_text_color text NOT NULL DEFAULT '#ffffff',
  badge_color text NOT NULL DEFAULT '#ffffff',
  highlight_text_color text NOT NULL DEFAULT '#3b82f6',
  font_family text NOT NULL DEFAULT 'Inter',
  privacy_policy_url text DEFAULT '',
  background_video_url text,
  background_image_url text,
  content_overlay_color text NOT NULL DEFAULT '#000000',
  content_overlay_opacity numeric NOT NULL DEFAULT 0.0,
  location_services_enabled boolean NOT NULL DEFAULT true,
  next_steps_title text NOT NULL DEFAULT 'What Happens Next?',
  next_steps_description text NOT NULL DEFAULT 'ANY NOTIFICATION OR DESIRED NEXT STEP HAPPENS HERE.',
  next_steps_box_color text NOT NULL DEFAULT '#1e3a5f',
  next_steps_text_color text NOT NULL DEFAULT '#FFFFFF'
);

-- Enable RLS
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

-- Block all direct access
CREATE POLICY "No direct select" ON public.branding_settings FOR SELECT USING (false);
CREATE POLICY "No direct insert" ON public.branding_settings FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON public.branding_settings FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON public.branding_settings FOR DELETE USING (false);

-- Insert default row
INSERT INTO public.branding_settings (company_name) VALUES ('Your Company');

-- Create verifications table
CREATE TABLE public.verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  verification_url text,
  status text NOT NULL DEFAULT 'created',
  decision text,
  reason text,
  first_name text,
  last_name text,
  latitude double precision,
  longitude double precision,
  city text,
  state text
);

-- Enable RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Block all direct access
CREATE POLICY "No direct select" ON public.verifications FOR SELECT USING (false);
CREATE POLICY "No direct insert" ON public.verifications FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON public.verifications FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON public.verifications FOR DELETE USING (false);

-- Auto-purge old verifications (optional)
CREATE OR REPLACE FUNCTION public.auto_purge_old_verifications()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF random() < 0.05 THEN
    DELETE FROM public.verifications WHERE created_at < NOW() - INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER purge_verifications_trigger
AFTER INSERT ON public.verifications
FOR EACH ROW EXECUTE FUNCTION public.auto_purge_old_verifications();
```

4. Click **"Run"** (bottom right)
5. Verify success message appears

---

## 📦 Step 3: Create Storage Buckets

1. Go to **Storage** in Supabase sidebar
2. Click **"Create a new bucket"**

### Bucket #1: logos
```
Name: logos
Public: ✅ ENABLE
File size limit: 5MB
Allowed MIME types: Leave empty (all images)
```
Click **"Create bucket"**

### Bucket #2: backgrounds
```
Name: backgrounds
Public: ✅ ENABLE
File size limit: 50MB
Allowed MIME types: Leave empty (all files)
```
Click **"Create bucket"**

---

## 🚀 Step 4: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**

```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://github.com/supabase/supabase/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
```

2. **Login to Supabase:**

```bash
supabase login
```

3. **Link Your Project:**

```bash
# Get your project ref from Supabase URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF
supabase link --project-ref YOUR_PROJECT_REF
```

4. **Deploy All Functions:**

```bash
cd /agentic/workspaces/default/projects/onboarding-reimagined

supabase functions deploy admin-login
supabase functions deploy get-branding
supabase functions deploy update-branding
supabase functions deploy upload-file
supabase functions deploy create-veriff-session
supabase functions deploy get-verifications
supabase functions deploy veriff-webhook
```

Each deploy should show: `✓ Deployed Function`

### Option B: Manual Deployment via Dashboard

If CLI doesn't work, you can manually copy-paste each function:

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **"Create a new function"**
3. Name it (e.g., `admin-login`)
4. Copy the contents of `supabase/functions/admin-login/index.ts`
5. Paste into the editor
6. Click **"Deploy"**
7. Repeat for all 7 functions

**Note:** You'll also need to manually add the shared utilities (`_shared/cors.ts` and `_shared/jwt.ts`) inline in each function if using manual deployment.

---

## 🌐 Step 5: Configure Frontend

1. **Create .env file:**

```bash
cp .env.example .env
```

2. **Edit .env with your Supabase credentials:**

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: **Supabase Dashboard → Project Settings → API**

3. **Build the frontend:**

```bash
bun install
bun run build
```

---

## 🔗 Step 6: Configure Veriff Webhook

1. Go to [Veriff Station](https://station.veriff.com/)
2. Log in with your Veriff account
3. Navigate to: **Settings → Integrations → Webhooks**
4. Click **"Add Webhook"**
5. Enter webhook URL:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/veriff-webhook
```

(Replace `YOUR_PROJECT_REF` with your actual Supabase project ID)

6. Select events: **Decision** (minimum required)
7. Click **"Save"**

---

## ✅ Step 7: Test Everything

### Test 1: Admin Login

1. Open: `http://localhost:5173/admin/login` (or your deployed URL)
2. Enter password: `Veriff#1`
3. Should redirect to `/admin` dashboard
4. ✅ Success if you see the dashboard

### Test 2: Branding

1. In admin panel, go to **Branding** tab
2. Change company name to "Test Company"
3. Click **"Save Changes"**
4. ✅ Success if you see "Branding updated successfully"

### Test 3: Verification Flow

1. Open: `/verify` in new tab
2. Click **"Start Verification"**
3. Allow permissions
4. Fill in name and location
5. Should see Veriff modal
6. ✅ Success if Veriff SDK loads

### Test 4: Verifications List

1. Back in admin panel
2. Go to **Verifications** tab
3. Click **"Refresh"**
4. ✅ Success if you see your test verification

---

## 🌍 Step 8: Deploy to Production

### Deploy Frontend to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy Frontend to Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy Frontend to Cloudflare Pages

```bash
npm i -g wrangler
wrangler pages deploy dist
```

---

## 📊 Monitoring & Logs

### View Edge Function Logs

1. Go to **Edge Functions** in Supabase
2. Click on a function name
3. Click **"Logs"** tab
4. View real-time logs

### Check for Errors

Look for lines starting with:
- `[ERROR]` - Something failed
- `[SECURITY]` - Security event
- `[INFO]` - Normal operation
- `[WARN]` - Warning but not critical

---

## 🔒 Security Checklist

- [ ] All 4 secrets added to Supabase
- [ ] RLS enabled on both tables
- [ ] Storage buckets are public (for logos/backgrounds only)
- [ ] Veriff webhook configured
- [ ] .env file NOT committed to Git
- [ ] Admin password is strong
- [ ] JWT_SECRET is random and secure
- [ ] Test admin login works
- [ ] Test verification flow works

---

## 🆘 Troubleshooting

### Problem: Admin login fails
**Solution:**
- Check ADMIN_PASSWORD secret in Supabase matches what you're entering
- Check JWT_SECRET is set correctly (64 chars)
- Check Edge Functions logs for errors

### Problem: Branding doesn't load
**Solution:**
- Check get-branding function is deployed
- Check database has a row in branding_settings table
- Check SUPABASE_SERVICE_ROLE_KEY is set (auto-set by Supabase)

### Problem: Verification session fails
**Solution:**
- Check VERIFF_API_KEY is correct
- Check Veriff account is active
- Check Edge Functions logs for API response
- Verify Veriff credentials at https://station.veriff.com/

### Problem: Webhook not working
**Solution:**
- Check VERIFF_API_SECRET is correct
- Check webhook URL in Veriff Station
- Check veriff-webhook function is deployed
- Look for signature validation errors in logs

### Problem: File uploads fail
**Solution:**
- Check storage buckets exist and are public
- Check file size limits (5MB images, 50MB videos)
- Check file type is allowed

---

## 📞 Next Steps

1. ✅ Customize branding in admin panel
2. ✅ Add your company logo
3. ✅ Set your brand colors
4. ✅ Configure next steps message
5. ✅ Test complete verification flow
6. ✅ Deploy to production
7. ✅ Share `/verify` URL with users

---

## 🎉 You're Done!

Your Veriff Identity Verification Portal is now live!

**Admin Panel:** `https://your-domain.com/admin`
**Verification Page:** `https://your-domain.com/verify`

**Admin Login:** `Veriff#1`

---

**Questions or issues?** Check the Edge Functions logs in Supabase Dashboard for detailed error messages.
