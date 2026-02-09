# Veriff Identity Verification Portal - Project Recreation Guide

A white-label identity verification application that integrates with **Veriff** for ID verification. Features a fully customizable branding system, admin panel, and verification tracking with geolocation.

---

## 🔐 Required Secrets

Configure these in your backend secrets:

| Secret Name | Description |
|------------|-------------|
| `ADMIN_PASSWORD` | Password for admin panel access |
| `JWT_SECRET` | Secret key for signing admin JWT tokens (use a strong random string, 32+ chars) |
| `VERIFF_API_KEY` | Your Veriff API key from [Veriff Dashboard](https://station.veriff.com/) |
| `VERIFF_API_SECRET` | Your Veriff API secret for webhook signature verification |

---

## 📊 Database Tables

### 1. `branding_settings`

Stores white-label customization settings.

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

-- RLS: Block all direct access (use edge functions)
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct select" ON public.branding_settings FOR SELECT USING (false);
CREATE POLICY "No direct insert" ON public.branding_settings FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON public.branding_settings FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON public.branding_settings FOR DELETE USING (false);

-- Insert default row
INSERT INTO public.branding_settings (company_name) VALUES ('Your Company');
```

### 2. `verifications`

Stores verification session records.

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

-- RLS: Block all direct access (use edge functions)
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct select" ON public.verifications FOR SELECT USING (false);
CREATE POLICY "No direct insert" ON public.verifications FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON public.verifications FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON public.verifications FOR DELETE USING (false);

-- Optional: Auto-purge old records (runs on ~5% of inserts)
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

---

## 📦 Storage Buckets

Create two **public** storage buckets:

| Bucket Name | Purpose | Public |
|------------|---------|--------|
| `logos` | Company logo uploads | ✅ Yes |
| `backgrounds` | Background videos/images | ✅ Yes |

---

## ⚡ Edge Functions

### Shared Utilities

#### `supabase/functions/_shared/cors.ts`

```typescript
// Shared CORS utilities for edge functions

function getAllowedOrigins(): string[] {
  const appOrigin = Deno.env.get("APP_ORIGIN");
  const origins: string[] = [];
  if (appOrigin) origins.push(appOrigin);
  origins.push("https://lovable.dev");
  return origins;
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovable.dev")) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
  return false;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (origin && isOriginAllowed(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hmac-signature, x-auth-client",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hmac-signature, x-auth-client",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}
```

#### `supabase/functions/_shared/jwt.ts`

```typescript
// JWT utilities for admin authentication

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
}

async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(data: Uint8Array | string): string {
  let base64: string;
  if (typeof data === "string") {
    base64 = btoa(data);
  } else {
    let binary = "";
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

export async function generateToken(secret: string, expiresInHours = 1): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = { sub: "admin", iat: now, exp: now + (expiresInHours * 60 * 60) };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signature = await createSignature(dataToSign, secret);
  return `${dataToSign}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, error: "Invalid token format" };
    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;
    const expectedSignature = await createSignature(dataToSign, secret);
    if (!timingSafeEqual(signatureB64, expectedSignature)) return { valid: false, error: "Invalid signature" };
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return { valid: false, error: "Token expired" };
    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Token verification failed" };
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
```

---

### Edge Function Overview

| Function | Auth | Purpose |
|----------|------|---------|
| `admin-login` | None (public) | Authenticate admin users |
| `get-branding` | None (public) | Fetch branding settings |
| `update-branding` | JWT | Update branding settings |
| `upload-file` | JWT | Upload logos/backgrounds |
| `create-veriff-session` | None (public) | Create verification session |
| `get-verifications` | JWT | Fetch all verifications |
| `veriff-webhook` | HMAC | Receive Veriff decisions |

**Note:** Full edge function implementations are required but not included here for brevity. Each function includes:
- CORS handling via shared utilities
- Rate limiting
- Input validation and sanitization
- Security logging
- Error handling

---

## 🖥️ Frontend Pages

### `/verify` (Public)

Multi-step verification flow:

1. **Idle:** Welcome screen with company branding
2. **Permissions:** Request camera/mic/location permissions
3. **Geolocation:** Capture name and location
4. **Loading:** Create Veriff session
5. **Veriff Modal:** In-context SDK for ID verification
6. **Submitted:** Confirmation with custom next steps

### `/admin/login`

Simple password authentication:
- Calls `admin-login` edge function
- Stores JWT in `sessionStorage`
- Redirects to `/admin` on success

### `/admin`

Two-tab admin panel:

**Verifications Tab:**
- Table of all verification attempts
- Search by last name
- Shows location (city/state)
- Click coordinates for Google Maps
- Status and decision badges
- Refresh button

**Branding Tab:**
- Company name and logo upload
- Color pickers (primary, secondary, text, buttons, badges, highlights)
- Font family selection
- Background video/image upload
- Content overlay settings
- Privacy policy URL
- Location services toggle
- Next steps customization
- Live preview button

---

## 📚 Key NPM Dependencies

```json
{
  "@veriff/incontext-sdk": "^2.5.0",
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.x",
  "react-router-dom": "^7.x",
  "lucide-react": "^0.553.0"
}
```

---

## 🔧 Setup Checklist

1. ☐ Create new React/TypeScript project
2. ☐ Install all dependencies
3. ☐ Add all 4 secrets (ADMIN_PASSWORD, JWT_SECRET, VERIFF_API_KEY, VERIFF_API_SECRET)
4. ☐ Run database migrations
5. ☐ Create storage buckets (`logos`, `backgrounds`) - set both as public
6. ☐ Create all edge functions with shared utilities
7. ☐ Insert initial branding_settings row
8. ☐ Configure Veriff webhook URL
9. ☐ Test admin login
10. ☐ Customize branding
11. ☐ Test verification flow

---

## 🔒 Security Features

- **RLS Policies:** All tables blocked from direct access
- **JWT Authentication:** Custom tokens (1-hour expiry)
- **Rate Limiting:** All endpoints protected
- **HMAC Verification:** Webhook signatures validated
- **Input Sanitization:** All inputs validated
- **Timing-Safe Comparisons:** Prevents timing attacks
- **Security Audit Logging:** All auth events logged

---

## 📝 License

This project template is provided for educational and commercial use.
