# 🔐 Secrets Collection Guide

This guide provides a secure way to collect and store your secrets before adding them to Supabase.

---

## 🎯 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the helper script
bash setup-secrets.sh
```

This will:
1. Create `.secrets.local` from template
2. Open it in your editor
3. Validate your secrets
4. Generate `.env` file automatically
5. Show you exactly what to copy to Supabase

### Option 2: Manual Setup

```bash
# Copy the template
cp .secrets.template .secrets.local

# Edit with your favorite editor
nano .secrets.local
# or
code .secrets.local
# or
vim .secrets.local
```

---

## 📋 What Secrets Do You Need?

### 1. **ADMIN_PASSWORD**
**Your choice** - Password for admin panel login

**Requirements:**
- Minimum 8 characters (12+ recommended)
- Include uppercase, lowercase, numbers, symbols
- Don't reuse passwords from other services

**Example:** `MySecure!Admin2024`

---

### 2. **JWT_SECRET**
**Generate this** - Secret key for signing admin JWT tokens

**Requirements:**
- Exactly 64 hexadecimal characters
- Random and unpredictable

**How to generate:**

```bash
# macOS/Linux:
openssl rand -hex 32

# Or with Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a7f3e9d2c8b4f1a6e3d9c5b2f8a4e1d7c3b9f5a2e8d4c1b7f3a9e5d2c8b4f1a6
```

---

### 3. **VERIFF_API_KEY**
**From Veriff** - API key for creating verification sessions

**How to get:**
1. Go to [Veriff Station](https://station.veriff.com/)
2. Log in to your account
3. Navigate to: **Settings → Integrations → API Keys**
4. Copy your **API Key**

**Format:** UUID-style (e.g., `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)

**Don't have a Veriff account?**
- Visit: https://www.veriff.com/
- Click "Get Started" or "Request Demo"
- They offer free trials

---

### 4. **VERIFF_API_SECRET**
**From Veriff** - Secret for verifying webhook signatures

**How to get:**
1. Same location as API Key in Veriff Station
2. Navigate to: **Settings → Integrations → API Keys**
3. Copy your **API Secret** (different from API Key)

**Format:** Long hexadecimal string

---

## 🔒 Security Features

### Built-in Protection

✅ **`.secrets.local` is in `.gitignore`**
- Will NEVER be committed to Git
- Safe to store locally during setup
- Delete after copying to Supabase

✅ **Template file is safe**
- Contains NO actual secrets
- Only instructions and empty fields
- Can be committed to Git

✅ **Helper script validates format**
- Checks JWT_SECRET is 64 chars
- Checks Supabase URL format
- Checks all required fields are filled

---

## 📝 Step-by-Step Instructions

### Step 1: Generate JWT Secret

```bash
# Run this command
openssl rand -hex 32
```

Copy the output (should be 64 characters).

### Step 2: Get Veriff Credentials

1. Open https://station.veriff.com/
2. Log in
3. Go to Settings → Integrations → API Keys
4. Copy both API Key and API Secret

### Step 3: Fill in Template

```bash
# Create your local secrets file
cp .secrets.template .secrets.local

# Edit it
nano .secrets.local
```

Fill in all the fields marked with `=` signs.

### Step 4: Validate (Optional)

```bash
# Run the helper script to validate
bash setup-secrets.sh
```

This will check:
- All required fields are filled
- JWT_SECRET is exactly 64 hex characters
- URLs are in correct format
- Passwords meet minimum length

### Step 5: Add to Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to: **Project Settings** (⚙️) → **Edge Functions**
4. Scroll to: **Secrets** section
5. Click **"New Secret"** and add each one:

| Name | Value |
|------|-------|
| `ADMIN_PASSWORD` | From your `.secrets.local` |
| `JWT_SECRET` | From your `.secrets.local` |
| `VERIFF_API_KEY` | From your `.secrets.local` |
| `VERIFF_API_SECRET` | From your `.secrets.local` |

6. Click **"Add Secret"** for each
7. Verify all 4 are listed

### Step 6: Create .env File

The helper script creates this automatically, or manually create `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
**Supabase Dashboard → Project Settings → API**

### Step 7: Clean Up

```bash
# After secrets are in Supabase, delete the local file
rm .secrets.local

# Store secrets in password manager instead
```

---

## ✅ Validation Checklist

Use this to verify your secrets are correct:

### JWT_SECRET Validation
```bash
# Check length (should output "64")
echo -n "YOUR_JWT_SECRET" | wc -c

# Check if hexadecimal (should output nothing if valid)
echo "YOUR_JWT_SECRET" | grep -v '^[0-9a-fA-F]*$'
```

### Password Strength
- [ ] At least 8 characters (12+ recommended)
- [ ] Contains uppercase letters
- [ ] Contains lowercase letters
- [ ] Contains numbers
- [ ] Contains special characters

### Veriff Credentials
- [ ] API Key looks like UUID format
- [ ] API Secret is a long string
- [ ] Both copied from Veriff Station
- [ ] Tested in Veriff documentation

### Supabase Configuration
- [ ] URL starts with `https://`
- [ ] URL ends with `.supabase.co`
- [ ] Anon key starts with `eyJ`
- [ ] Both from Project Settings → API

---

## 🚨 What NOT to Do

❌ **Never commit `.secrets.local` to Git**
- It's in `.gitignore` for safety
- Double-check before committing

❌ **Never share secrets via:**
- Email
- Slack/Discord/Teams
- Screenshots
- Text messages
- Unencrypted notes

❌ **Never hardcode secrets in code**
- Always use environment variables
- Never put in `package.json` or other configs

❌ **Never use weak passwords**
- No common passwords (password123, admin, etc.)
- No personal information (birthdate, name, etc.)
- No reused passwords

---

## 🔄 Rotating Secrets

If you need to change secrets:

### Rotate JWT_SECRET
```bash
# Generate new secret
openssl rand -hex 32

# Update in Supabase
# All admin users will be logged out
```

### Rotate Admin Password
```bash
# Just update ADMIN_PASSWORD in Supabase
# Existing sessions remain valid
```

### Rotate Veriff Credentials
```bash
# Generate new keys in Veriff Station
# Update in Supabase
# Update webhook configuration
```

---

## 💾 Storing Secrets Long-Term

**Recommended: Password Manager**

Use a password manager to store secrets securely:

- **1Password** - https://1password.com/
- **Bitwarden** - https://bitwarden.com/
- **LastPass** - https://www.lastpass.com/
- **Dashlane** - https://www.dashlane.com/

**Template for password manager:**

```
Title: Veriff Portal - Production Secrets
URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

ADMIN_PASSWORD: [value]
JWT_SECRET: [value]
VERIFF_API_KEY: [value]
VERIFF_API_SECRET: [value]

Supabase URL: [value]
Supabase Anon Key: [value]

Created: [date]
Last Updated: [date]
Notes: Production environment
```

---

## 🆘 Troubleshooting

**Problem:** JWT_SECRET validation fails

```bash
# Check length
echo -n "$JWT_SECRET" | wc -c  # Should be 64

# Check format (no output = valid)
echo "$JWT_SECRET" | grep -v '^[0-9a-fA-F]*$'
```

**Problem:** Secrets not working in Supabase

- Check for typos when copying
- Check for extra spaces or newlines
- Regenerate and re-add
- Check Edge Functions logs for errors

**Problem:** Can't find Veriff API keys

- Email: support@veriff.com
- Live chat in Veriff Station
- Check Settings → Integrations → API Keys

**Problem:** Lost JWT_SECRET

- Generate a new one (old admin sessions invalidated)
- Update in Supabase
- Re-login to admin panel

---

## 📞 Next Steps

After setting up secrets:

1. ✅ Verify all secrets in Supabase
2. ✅ Create database tables (see `QUICKSTART.md`)
3. ✅ Create storage buckets
4. ✅ Deploy edge functions
5. ✅ Test admin login
6. ✅ Test verification flow

---

## 📚 Related Documentation

- **`QUICKSTART.md`** - Full setup guide
- **`PROJECT_RECREATION_GUIDE.md`** - Backend implementation
- **`SECRETS_SETUP.md`** - Detailed security guide
- **`.secrets.template`** - Template file to fill in

---

**Remember:** Security is not optional. Take the time to properly secure your secrets! 🔐
