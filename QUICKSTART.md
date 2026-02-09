# Quick Start Guide

Get your Veriff Identity Verification Portal up and running in minutes.

## 🚀 Quick Setup (5 Minutes)

### 1. Frontend Setup

```bash
# Clone and install
bun install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Setup

#### A. Configure Secrets
Go to Supabase → Settings → Edge Functions → Secrets:

```
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=random-32-character-string-here
VERIFF_API_KEY=your-veriff-api-key
VERIFF_API_SECRET=your-veriff-api-secret
```

#### B. Create Database Tables

**Run this SQL in Supabase SQL Editor:**

```sql
-- Branding Settings Table
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

ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct access" ON public.branding_settings FOR ALL USING (false);

INSERT INTO public.branding_settings (company_name) VALUES ('Your Company');

-- Verifications Table
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

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct access" ON public.verifications FOR ALL USING (false);
```

#### C. Create Storage Buckets
1. Go to Supabase → Storage
2. Create bucket `logos` (make it public)
3. Create bucket `backgrounds` (make it public)

#### D. Deploy Edge Functions

You need to deploy 7 edge functions. See `PROJECT_RECREATION_GUIDE.md` for complete code.

The functions are:
- `admin-login`
- `get-branding`
- `update-branding`
- `upload-file`
- `create-veriff-session`
- `get-verifications`
- `veriff-webhook`

Plus 2 shared utilities in `_shared/`:
- `cors.ts`
- `jwt.ts`

### 3. Veriff Configuration

1. Login to [Veriff Station](https://station.veriff.com/)
2. Go to Settings → Webhooks
3. Add webhook: `https://your-project-id.supabase.co/functions/v1/veriff-webhook`

### 4. Test It!

```bash
# Build the app
bun run build

# Test the verification flow
# Open: http://localhost:5173/verify

# Test admin panel
# Open: http://localhost:5173/admin/login
# Use the password from ADMIN_PASSWORD secret
```

## 🎯 What You Get

### `/verify` - Public Verification Flow
1. **Idle Screen**: Welcome with company branding
2. **Permissions**: Request camera, mic, location access
3. **User Info**: Collect name and location
4. **Loading**: Create Veriff session
5. **Veriff SDK**: Complete ID verification
6. **Success**: Customizable confirmation message

### `/admin` - Admin Dashboard
- **Verifications Tab**: View all verification attempts with location data
- **Branding Tab**: Customize all colors, logos, fonts, and messages

## 🔑 Default Admin Login

Use the password you set in `ADMIN_PASSWORD` secret.

## ⚠️ Important Notes

- This is a **static frontend app** - no backend code runs in this repo
- All backend logic is in Supabase Edge Functions
- Database is protected by RLS - only edge functions can access it
- Build with `bun run build` and deploy the `dist/` folder

## 📚 Next Steps

1. Customize branding in admin panel (`/admin`)
2. Test verification flow with Veriff test environment
3. Add your domain to Veriff allowed origins
4. Deploy `dist/` folder to your hosting provider

## 🆘 Need Help?

Check `README.md` for detailed documentation and troubleshooting.

---

**You're all set!** 🎉 Start customizing your verification portal.
