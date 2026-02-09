# 🔐 Secrets Quick Reference Card

**Print or save this for easy reference during setup.**

---

## 📋 Secrets Checklist

### Backend Secrets (Add to Supabase)

| Secret Name | Source | Format |
|------------|--------|--------|
| `ADMIN_PASSWORD` | Your choice | 8+ chars, strong password |
| `JWT_SECRET` | Generate | 64 hex characters |
| `VERIFF_API_KEY` | Veriff Station | UUID format |
| `VERIFF_API_SECRET` | Veriff Station | Hex string |

### Frontend Config (Add to .env)

| Variable Name | Source | Format |
|--------------|--------|--------|
| `VITE_SUPABASE_URL` | Supabase Dashboard | https://xxxxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard | Starts with eyJ... |

---

## ⚡ Quick Commands

### Generate JWT Secret
```bash
# macOS/Linux
openssl rand -hex 32

# Copy output (64 characters)
```

### Setup Helper Script
```bash
# Creates .secrets.local and validates
bash setup-secrets.sh
```

### Manual Template Setup
```bash
# Copy template
cp .secrets.template .secrets.local

# Edit with your values
nano .secrets.local
```

---

## 🔗 Quick Links

| Service | URL | What to Get |
|---------|-----|-------------|
| Veriff Station | https://station.veriff.com/ | API Key & Secret |
| Supabase Dashboard | https://supabase.com/dashboard | Project URL & Anon Key |
| Supabase Secrets | Dashboard → Settings → Edge Functions → Secrets | Where to add backend secrets |

---

## 📍 Where to Find Things

### In Veriff Station
1. Log in to https://station.veriff.com/
2. Go to: **Settings → Integrations → API Keys**
3. Copy:
   - API Key (UUID format)
   - API Secret (hex string)

### In Supabase Dashboard
1. Open your project
2. For Frontend Config:
   - Go to: **Project Settings → API**
   - Copy: Project URL and anon/public key
3. For Backend Secrets:
   - Go to: **Project Settings → Edge Functions**
   - Click: **New Secret** (repeat 4 times)

---

## ✅ Validation Rules

### ADMIN_PASSWORD
- ✅ Minimum 8 characters
- ✅ Mix of upper/lower/numbers/symbols
- ❌ No common passwords

### JWT_SECRET
- ✅ Exactly 64 characters
- ✅ Only hexadecimal (0-9, a-f)
- ❌ No spaces or special characters

### VERIFF_API_KEY
- ✅ UUID format with dashes
- ✅ From Veriff Station
- ❌ Not empty

### VERIFF_API_SECRET
- ✅ Long hexadecimal string
- ✅ From Veriff Station
- ❌ Not empty

### VITE_SUPABASE_URL
- ✅ Starts with https://
- ✅ Ends with .supabase.co
- ❌ No trailing slash

### VITE_SUPABASE_ANON_KEY
- ✅ Starts with eyJ
- ✅ Very long string (JWT format)
- ❌ Not the service_role key

---

## 🚀 Setup Flow

```
1. Generate JWT_SECRET
   ↓
2. Get Veriff credentials
   ↓
3. Fill in .secrets.local
   ↓
4. Validate with helper script
   ↓
5. Add 4 secrets to Supabase
   ↓
6. Create .env file
   ↓
7. Delete .secrets.local
   ↓
8. Store in password manager
```

---

## 🔒 Security Quick Tips

✅ **DO:**
- Use password manager
- Generate random JWT_SECRET
- Delete .secrets.local after use
- Use different secrets per environment

❌ **DON'T:**
- Commit secrets to Git
- Share via email/Slack
- Screenshot secrets
- Reuse passwords

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| JWT_SECRET wrong length | Must be exactly 64 chars - regenerate |
| Veriff keys not working | Check for typos, regenerate in Station |
| Admin login fails | Check ADMIN_PASSWORD in Supabase matches |
| Supabase URL format error | Must be https://xxxxx.supabase.co |

---

## 📝 Copy-Paste Template

```bash
# Generate JWT Secret
openssl rand -hex 32

# After filling .secrets.local, validate
bash setup-secrets.sh

# Clean up after adding to Supabase
rm .secrets.local
```

---

## 🎯 Success Indicators

You're done when:
- [ ] All 4 backend secrets in Supabase
- [ ] .env file created with Supabase config
- [ ] .secrets.local deleted
- [ ] Secrets stored in password manager
- [ ] Admin login works
- [ ] No secrets committed to Git

---

**Keep this reference handy during setup!** 🔐

For detailed instructions, see:
- **README-SECRETS.md** - Full guide
- **SECRETS_SETUP.md** - Security details
- **QUICKSTART.md** - Complete setup
