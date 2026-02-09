# Backend Secrets Setup Guide

This guide will help you collect and configure all required backend secrets.

---

## 📋 Required Secrets (4 Total)

### 1. `ADMIN_PASSWORD`
**What it is:** The password you'll use to log into the admin panel at `/admin/login`

**How to create it:**
- Choose a strong password (12+ characters recommended)
- Include uppercase, lowercase, numbers, and symbols
- Example: `MySecureAdm!n2024`

**⚠️ Important:**
- This is YOUR password - choose something secure
- Don't share this password
- Store it in a password manager

---

### 2. `JWT_SECRET`
**What it is:** A secret key used to sign JWT tokens for admin authentication

**How to create it:**
Generate a random 64-character hex string. Use one of these methods:

**Method 1: Online Generator**
- Visit: https://www.random.org/strings/
- Set: Length=64, Characters=Hex
- Click "Get Strings"

**Method 2: Command Line**
```bash
# On macOS/Linux:
openssl rand -hex 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 3: Use This Pre-Generated One (for testing only)**
```
a7f3e9d2c8b4f1a6e3d9c5b2f8a4e1d7c3b9f5a2e8d4c1b7f3a9e5d2c8b4f1a6
```

**⚠️ Important:**
- NEVER commit this to version control
- Generate a new one for production
- Keep it secret and secure

---

### 3. `VERIFF_API_KEY`
**What it is:** Your Veriff API key for creating verification sessions

**How to get it:**

1. Go to [Veriff Station](https://station.veriff.com/)
2. Log in with your Veriff account credentials
3. Navigate to: **Settings → Integrations → API Keys**
4. Copy your **API Key** (looks like: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)

**Don't have a Veriff account?**
- Visit: https://www.veriff.com/
- Click "Get Started" or "Request a Demo"
- Create an account (they offer a free trial)

---

### 4. `VERIFF_API_SECRET`
**What it is:** Your Veriff API secret for verifying webhook signatures

**How to get it:**

1. In [Veriff Station](https://station.veriff.com/)
2. Go to: **Settings → Integrations → API Keys**
3. Copy your **API Secret** (looks like a long hex string)

**⚠️ Important:**
- This is different from the API Key
- Used to verify webhook authenticity
- Keep it secret

---

## 🔐 How to Add Secrets to Supabase

Once you have all 4 secrets, add them to your Supabase project:

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Secrets**
   - Click: **Project Settings** (gear icon in sidebar)
   - Click: **Edge Functions** tab
   - Scroll to: **Secrets** section

3. **Add Each Secret**
   For each secret, click **"New Secret"** and enter:

   ```
   Name: ADMIN_PASSWORD
   Value: [your chosen admin password]
   ```

   ```
   Name: JWT_SECRET
   Value: [your generated JWT secret]
   ```

   ```
   Name: VERIFF_API_KEY
   Value: [from Veriff Dashboard]
   ```

   ```
   Name: VERIFF_API_SECRET
   Value: [from Veriff Dashboard]
   ```

4. **Save**
   - Click **"Add Secret"** for each one
   - Verify all 4 secrets are listed

---

## ✅ Verification Checklist

Before proceeding, make sure you have:

- [ ] Generated a strong admin password
- [ ] Generated or copied a JWT secret (64 characters)
- [ ] Retrieved Veriff API Key from Veriff Dashboard
- [ ] Retrieved Veriff API Secret from Veriff Dashboard
- [ ] Added all 4 secrets to Supabase Edge Functions
- [ ] Verified all secrets are saved (no typos)

---

## 🚨 Security Best Practices

1. **Never commit secrets to Git**
   - Secrets should ONLY be in Supabase
   - Never in `.env` files that get committed
   - Add `.env` to `.gitignore` (already done)

2. **Store secrets securely**
   - Use a password manager (1Password, LastPass, Bitwarden)
   - Don't share via email or Slack
   - Don't screenshot secrets

3. **Rotate secrets regularly**
   - Change admin password every 90 days
   - Generate new JWT secret if compromised
   - Rotate Veriff keys annually

4. **Use different secrets for each environment**
   - Development: Different secrets
   - Staging: Different secrets
   - Production: Different secrets

---

## 📝 Secret Storage Template

Copy this template and fill it in (store in your password manager):

```
PROJECT: Veriff Verification Portal
ENVIRONMENT: Production

ADMIN_PASSWORD: [your password]
JWT_SECRET: [64-char hex string]
VERIFF_API_KEY: [from Veriff]
VERIFF_API_SECRET: [from Veriff]

SUPABASE_URL: https://[project-id].supabase.co
SUPABASE_ANON_KEY: [from Supabase dashboard]

Date Created: [today's date]
Created By: [your name]
Last Updated: [date]
```

---

## 🆘 Troubleshooting

**Problem:** Can't find Veriff API Keys
- **Solution:** Email Veriff support at support@veriff.com or use live chat in Station

**Problem:** Lost my JWT secret
- **Solution:** Generate a new one (old admin sessions will be invalidated)

**Problem:** Forgot admin password
- **Solution:** Update `ADMIN_PASSWORD` secret in Supabase

**Problem:** Secrets not working
- **Solution:** Check for typos, extra spaces, or newlines when copying

---

## 📞 Next Steps

Once all secrets are configured:

1. ✅ Proceed to database setup (create tables)
2. ✅ Create storage buckets
3. ✅ Deploy edge functions
4. ✅ Test admin login
5. ✅ Configure Veriff webhook

See `QUICKSTART.md` for the full setup process.

---

**Status:** Secrets collected? ☐ | Added to Supabase? ☐ | Verified working? ☐
