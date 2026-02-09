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
