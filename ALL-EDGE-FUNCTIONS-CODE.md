# All Edge Functions - Complete Code

Copy each code block into the corresponding file on your Mac.

---

## 📁 File: `supabase/functions/_shared/cors.ts`

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

---

## 📁 File: `supabase/functions/_shared/jwt.ts`

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
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
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
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

export async function generateToken(
  secret: string,
  expiresInHours = 1
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: "admin",
    iat: now,
    exp: now + expiresInHours * 60 * 60,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signature = await createSignature(dataToSign, secret);

  return `${dataToSign}.${signature}`;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;
    const expectedSignature = await createSignature(dataToSign, secret);

    if (!timingSafeEqual(signatureB64, expectedSignature)) {
      return { valid: false, error: "Invalid signature" };
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: "Token verification failed" };
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
```

---

## 📁 File: `supabase/functions/admin-login/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { generateToken } from "../_shared/jwt.ts";

// Rate limiting storage
const loginAttempts = new Map<string, { count: number; lockoutUntil?: number }>();

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
         req.headers.get("x-real-ip") ||
         "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (attempts?.lockoutUntil && now < attempts.lockoutUntil) {
    const remainingSeconds = Math.ceil((attempts.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
    };
  }

  if (attempts?.lockoutUntil && now >= attempts.lockoutUntil) {
    loginAttempts.delete(ip);
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0 };

  attempts.count += 1;

  if (attempts.count >= 3) {
    attempts.lockoutUntil = now + 5 * 60 * 1000; // 5 minute lockout
    attempts.count = 0;
  }

  loginAttempts.set(ip, attempts);
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip);
}

async function timingSafePasswordCompare(
  provided: string,
  expected: string
): Promise<boolean> {
  // Add 2-second delay on failed attempts to prevent timing attacks
  const encoder = new TextEncoder();
  const providedBytes = encoder.encode(provided);
  const expectedBytes = encoder.encode(expected);

  let result = providedBytes.length === expectedBytes.length ? 0 : 1;

  const maxLength = Math.max(providedBytes.length, expectedBytes.length);
  for (let i = 0; i < maxLength; i++) {
    const a = i < providedBytes.length ? providedBytes[i] : 0;
    const b = i < expectedBytes.length ? expectedBytes[i] : 0;
    result |= a ^ b;
  }

  const isValid = result === 0;

  if (!isValid) {
    // Add delay on failed attempts
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return isValid;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: rateLimit.message }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "Password is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    const jwtSecret = Deno.env.get("JWT_SECRET");

    if (!adminPassword || !jwtSecret) {
      console.error("[ERROR] Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await timingSafePasswordCompare(password, adminPassword);

    if (!isValid) {
      recordFailedAttempt(clientIP);
      console.log(`[SECURITY] Failed login attempt from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    resetAttempts(clientIP);
    const token = await generateToken(jwtSecret, 1); // 1 hour expiry

    console.log(`[SECURITY] Successful login from IP: ${clientIP}`);

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ERROR] Admin login error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## 📁 File: `supabase/functions/get-branding/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[ERROR] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the first branding settings row (there should only be one)
    const { data, error } = await supabase
      .from("branding_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("[ERROR] Failed to fetch branding:", error);

      // If no branding exists, return defaults
      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            company_name: "Your Company",
            logo_url: null,
            primary_color: "#1e3a5f",
            secondary_color: "#f8fafc",
            text_color: "#1e293b",
            button_color: "#1e3a5f",
            button_text_color: "#ffffff",
            badge_color: "#ffffff",
            highlight_text_color: "#3b82f6",
            font_family: "Inter",
            privacy_policy_url: "",
            background_video_url: null,
            background_image_url: null,
            content_overlay_color: "#000000",
            content_overlay_opacity: 0.0,
            location_services_enabled: true,
            next_steps_title: "What Happens Next?",
            next_steps_description: "ANY NOTIFICATION OR DESIRED NEXT STEP HAPPENS HERE.",
            next_steps_box_color: "#1e3a5f",
            next_steps_text_color: "#FFFFFF",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to fetch branding settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ERROR] Get branding error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

Due to length limits, I'll continue in the next file...

**See the project files for the remaining 5 functions:**
- `update-branding/index.ts`
- `upload-file/index.ts`
- `create-veriff-session/index.ts`
- `get-verifications/index.ts`
- `veriff-webhook/index.ts`

**All complete code is already in the project at:**
`/agentic/workspaces/default/projects/onboarding-reimagined/supabase/functions/`

---

## Quick Mac Setup Commands

```bash
# Create directory structure
mkdir -p supabase/functions/_shared
mkdir -p supabase/functions/{admin-login,get-branding,update-branding,upload-file,create-veriff-session,get-verifications,veriff-webhook}

# Then copy each file's content from the project into the corresponding location
```

---

**All files are ready in this project! Download the entire `supabase/functions/` directory to your Mac.** 🚀
