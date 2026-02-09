# 📦 Edge Functions Summary

All 7 production-ready edge functions have been created with your secrets.

---

## ✅ Your Configured Secrets

```
ADMIN_PASSWORD: Veriff#1
JWT_SECRET: b8f4e2d9a7c3f1e6d4b2a8f5e3d1c9b7f6e4d2a9c8f7e5d3b1a6f4e2d9c7b5a3
VERIFF_API_KEY: c59bb395-ae20-4505-84e9-4483d191b29e
VERIFF_API_SECRET: 9cbb655d-f7c3-44d0-9b69-7c6a9fa63988
```

**⚠️ Important:** Add these to Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

## 📁 Files Created

### Shared Utilities
```
supabase/functions/_shared/
├── cors.ts          # CORS handling for all functions
└── jwt.ts           # JWT token generation and verification
```

### Edge Functions
```
supabase/functions/
├── admin-login/
│   └── index.ts     # Admin authentication with rate limiting
├── get-branding/
│   └── index.ts     # Fetch branding settings (public)
├── update-branding/
│   └── index.ts     # Update branding (admin only)
├── upload-file/
│   └── index.ts     # File uploads to storage (admin only)
├── create-veriff-session/
│   └── index.ts     # Create verification sessions (public)
├── get-verifications/
│   └── index.ts     # Fetch all verifications (admin only)
└── veriff-webhook/
    └── index.ts     # Handle Veriff decision webhooks
```

---

## 🔐 Security Features Implemented

### All Functions
- ✅ CORS handling with origin validation
- ✅ Input validation and sanitization
- ✅ Error handling with security logging
- ✅ Environment variable validation

### admin-login
- ✅ Rate limiting (3 attempts, 5-min lockout)
- ✅ Timing-safe password comparison
- ✅ 2-second delay on failed attempts
- ✅ IP-based security logging
- ✅ JWT token generation (1-hour expiry)

### update-branding
- ✅ JWT authentication required
- ✅ Rate limiting (10 requests/minute)
- ✅ Hex color validation
- ✅ URL format validation
- ✅ String sanitization and length limits

### upload-file
- ✅ JWT authentication required
- ✅ File type validation (images/videos only)
- ✅ File size limits (5MB images, 50MB videos)
- ✅ MIME type checking

### create-veriff-session
- ✅ Rate limiting (10 requests/minute)
- ✅ Reverse geocoding via OpenStreetMap
- ✅ Input validation
- ✅ Session tracking in database

### get-verifications
- ✅ JWT authentication required
- ✅ Rate limiting (10 requests/minute)
- ✅ Excludes sensitive verification_url field

### veriff-webhook
- ✅ HMAC signature verification
- ✅ Timing-safe signature comparison
- ✅ Decision normalization (pass/fail)
- ✅ Webhook replay protection

---

## 🚀 Deployment Commands

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# or
scoop install supabase  # Windows
# or
curl -fsSL ... | tar -xz  # Linux

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
cd /agentic/workspaces/default/projects/onboarding-reimagined

supabase functions deploy admin-login
supabase functions deploy get-branding
supabase functions deploy update-branding
supabase functions deploy upload-file
supabase functions deploy create-veriff-session
supabase functions deploy get-verifications
supabase functions deploy veriff-webhook
```

---

## 📊 Function Details

### 1. admin-login
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-login`
**Method:** POST
**Auth:** None (public)
**Rate Limit:** 3 attempts/min, 5-min lockout
**Request:**
```json
{
  "password": "Veriff#1"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here"
}
```

### 2. get-branding
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-branding`
**Method:** GET
**Auth:** None (public)
**Rate Limit:** None
**Response:** Full branding settings object

### 3. update-branding
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-branding`
**Method:** POST
**Auth:** Bearer token (JWT)
**Rate Limit:** 10/min
**Request:**
```json
{
  "branding": {
    "company_name": "Acme Corp",
    "primary_color": "#1e3a5f",
    ...
  }
}
```

### 4. upload-file
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/upload-file`
**Method:** POST (multipart/form-data)
**Auth:** Bearer token (JWT)
**Rate Limit:** None
**Form Data:**
- `file`: File blob
- `bucket`: "logos" or "backgrounds"
- `fileName`: Desired filename

### 5. create-veriff-session
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-veriff-session`
**Method:** POST
**Auth:** None (public)
**Rate Limit:** 10/min
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
**Response:**
```json
{
  "sessionId": "veriff-session-id",
  "url": "https://magic.veriff.me/..."
}
```

### 6. get-verifications
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-verifications`
**Method:** GET
**Auth:** Bearer token (JWT)
**Rate Limit:** 10/min
**Response:**
```json
{
  "verifications": [
    {
      "id": "uuid",
      "session_id": "veriff-session-id",
      "first_name": "John",
      "last_name": "Doe",
      "status": "submitted",
      "decision": "pass",
      "city": "New York",
      "state": "New York",
      "created_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### 7. veriff-webhook
**URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/veriff-webhook`
**Method:** POST
**Auth:** HMAC signature (x-hmac-signature header)
**Rate Limit:** None
**Veriff Payload:** Standard Veriff webhook format
**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🧪 Testing Functions

### Test admin-login
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-login \
  -H "Content-Type: application/json" \
  -d '{"password":"Veriff#1"}'
```

### Test get-branding
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-branding
```

### Test with JWT (after login)
```bash
TOKEN="your-jwt-token"

curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-verifications \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Environment Variables Required

These are automatically available in Supabase Edge Functions:

| Variable | Auto-Set | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ Yes | Your project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Service role key (full access) |
| `ADMIN_PASSWORD` | ❌ No | You add this |
| `JWT_SECRET` | ❌ No | You add this |
| `VERIFF_API_KEY` | ❌ No | You add this |
| `VERIFF_API_SECRET` | ❌ No | You add this |

---

## 🔍 Logs and Debugging

All functions log to Supabase Edge Functions logs:

**Prefixes:**
- `[ERROR]` - Something failed, needs attention
- `[SECURITY]` - Security event (failed login, invalid signature)
- `[INFO]` - Normal operation
- `[WARN]` - Warning but not critical

**View logs:**
1. Supabase Dashboard → Edge Functions
2. Click function name
3. Click "Logs" tab

---

## ✅ Deployment Checklist

- [ ] Add 4 secrets to Supabase
- [ ] Create database tables (SQL in DEPLOYMENT_INSTRUCTIONS.md)
- [ ] Create storage buckets (logos, backgrounds)
- [ ] Deploy all 7 edge functions
- [ ] Configure Veriff webhook URL
- [ ] Test admin login
- [ ] Test branding fetch
- [ ] Test verification creation
- [ ] Test webhook (create a verification)

---

## 🎯 Next Steps

1. **Add secrets** - Follow DEPLOYMENT_INSTRUCTIONS.md Step 1
2. **Create tables** - Run SQL from Step 2
3. **Create buckets** - Follow Step 3
4. **Deploy functions** - Use CLI commands above
5. **Configure webhook** - Add URL to Veriff Station
6. **Test everything** - Use curl commands or frontend

---

## 📞 Support

If you encounter issues:
1. Check Edge Functions logs in Supabase
2. Verify all 4 secrets are set correctly
3. Ensure database tables exist
4. Confirm storage buckets are public
5. Test with curl commands first

---

**All edge functions are production-ready and include:**
- Comprehensive error handling
- Security best practices
- Rate limiting
- Input validation
- Detailed logging

**Ready to deploy! 🚀**
