# Veriff Identity Verification Portal

A white-label identity verification application that integrates with **Veriff** for ID verification. Features a fully customizable branding system, admin panel, and verification tracking with geolocation.

## 🚀 Features

- **Multi-step Verification Flow**: Idle → Permissions → Geolocation → Veriff SDK → Submitted
- **White-Label Branding**: Fully customizable colors, logos, fonts, and backgrounds
- **Admin Dashboard**: Manage verifications and customize branding
- **Geolocation Tracking**: Optional location capture with reverse geocoding
- **Veriff Integration**: In-context SDK for seamless ID verification
- **Responsive Design**: Built with shadcn/ui and Tailwind CSS

## 📋 Prerequisites

- **Bun** 1.2+ (or Node.js 18+)
- **Supabase** account with Edge Functions enabled
- **Veriff** account with API credentials

## 🛠️ Setup Instructions

### 1. Frontend Setup

```bash
# Install dependencies
bun install

# Create environment file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Backend Setup (Supabase)

#### Required Secrets

Configure these in your Supabase project (Settings → Edge Functions → Secrets):

| Secret Name | Description |
|------------|-------------|
| `ADMIN_PASSWORD` | Password for admin panel access |
| `JWT_SECRET` | Secret key for signing admin JWT tokens (32+ random chars) |
| `VERIFF_API_KEY` | Your Veriff API key from [Veriff Dashboard](https://station.veriff.com/) |
| `VERIFF_API_SECRET` | Your Veriff API secret for webhook signature verification |

#### Database Setup

Run these SQL migrations in the Supabase SQL Editor:

**1. Create `branding_settings` table:**

```sql
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

-- Enable RLS (all access via edge functions only)
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct access" ON public.branding_settings FOR ALL USING (false);

-- Insert default settings
INSERT INTO public.branding_settings (company_name) VALUES ('Your Company');
```

**2. Create `verifications` table:**

```sql
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
CREATE POLICY "No direct access" ON public.verifications FOR ALL USING (false);

-- Auto-purge old records (optional)
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

#### Storage Buckets

Create two public storage buckets in Supabase:

1. **`logos`** - For company logo uploads
2. **`backgrounds`** - For background videos/images

Make both buckets **public** (Settings → Storage → Create bucket → Enable "Public bucket").

#### Edge Functions

You need to create these 7 edge functions in your Supabase project. Refer to the `PROJECT_RECREATION_GUIDE.md` for complete edge function code:

1. **`admin-login`** - Admin authentication
2. **`get-branding`** - Fetch branding settings (public)
3. **`update-branding`** - Update branding (admin only)
4. **`upload-file`** - Upload logos/backgrounds (admin only)
5. **`create-veriff-session`** - Create verification session (public)
6. **`get-verifications`** - Fetch all verifications (admin only)
7. **`veriff-webhook`** - Receive Veriff decision webhooks

**Shared utilities** (place in `supabase/functions/_shared/`):
- `cors.ts` - CORS handling utilities
- `jwt.ts` - JWT token generation and verification

### 3. Veriff Configuration

1. Go to [Veriff Station](https://station.veriff.com/)
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://your-project-id.supabase.co/functions/v1/veriff-webhook`
4. Copy your API key and secret to Supabase secrets

## 🎨 Branding Customization

Access the admin panel at `/admin` to customize:

- Company name and logo
- Primary, secondary, text, button, badge, and highlight colors
- Font family (Google Fonts)
- Background video or image with overlay
- Privacy policy URL
- Location services toggle
- Next steps confirmation message

## 🔒 Security Features

- **Row Level Security (RLS)**: All database access restricted to edge functions
- **JWT Authentication**: Custom tokens for admin sessions (1-hour expiry)
- **Rate Limiting**: All endpoints protected against abuse
- **HMAC Verification**: Webhook signatures validated
- **Input Sanitization**: All user inputs validated
- **Timing-Safe Comparisons**: Prevents timing attacks

## 🚀 Development

```bash
# Start development server (NEVER use in production)
bun run dev

# Build for production
bun run build

# Preview production build
bunx vite preview
```

## 📦 Deployment

This is a **static frontend application**. Deploy the `dist/` folder to any static hosting:

- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

The backend (edge functions + database) is hosted on Supabase.

## 🗺️ Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── admin/           # Admin dashboard components
│   │   ├── VerificationsTab.tsx
│   │   └── BrandingTab.tsx
│   ├── verify/          # Verification flow steps
│   │   ├── IdleStep.tsx
│   │   ├── PermissionsStep.tsx
│   │   ├── GeolocationStep.tsx
│   │   ├── LoadingStep.tsx
│   │   ├── VeriffStep.tsx
│   │   └── SubmittedStep.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── BrandingContext.tsx
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts           # API client functions
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── pages/
│   ├── VerifyPage.tsx
│   ├── AdminLoginPage.tsx
│   └── AdminDashboard.tsx
├── types/
│   ├── branding.ts
│   └── verification.ts
├── App.tsx
└── main.tsx
```

## 📚 Documentation

For complete backend implementation details, see:
- `PROJECT_RECREATION_GUIDE.md` - Full edge function code and setup guide

## 🔧 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **shadcn/ui** + Tailwind CSS for UI
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Veriff In-Context SDK** for verification
- **Supabase** for backend

### Backend (Supabase)
- **Edge Functions** (Deno) for API endpoints
- **PostgreSQL** for database
- **Storage** for file uploads
- **Row Level Security** for data protection

## 🐛 Troubleshooting

### "Missing Supabase credentials" error
- Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after adding environment variables

### Veriff SDK not loading
- Check that `@veriff/incontext-sdk` is installed
- Ensure you're creating sessions with valid Veriff API credentials
- Check browser console for errors

### Admin login fails
- Verify `ADMIN_PASSWORD` secret is set in Supabase
- Check that `admin-login` edge function is deployed
- Ensure CORS is configured correctly in edge functions

### File uploads fail
- Confirm storage buckets are created and public
- Verify `upload-file` edge function is deployed
- Check file size limits (5MB images, 50MB videos)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using React, shadcn/ui, Supabase, and Veriff
