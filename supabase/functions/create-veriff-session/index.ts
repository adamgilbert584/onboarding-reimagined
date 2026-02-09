import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Rate limiting
const sessionAttempts = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = sessionAttempts.get(ip) || [];

  // Remove attempts older than 1 minute
  const recentAttempts = attempts.filter(time => now - time < 60000);

  if (recentAttempts.length >= 10) {
    return false;
  }

  recentAttempts.push(now);
  sessionAttempts.set(ip, recentAttempts);
  return true;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<{ city?: string; state?: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          "User-Agent": "Veriff-Identity-Portal/1.0",
        },
      }
    );

    if (!response.ok) {
      console.warn("[WARN] Reverse geocoding failed:", response.status);
      return {};
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.county,
      state: address.state,
    };
  } catch (error) {
    console.error("[ERROR] Reverse geocoding error:", error);
    return {};
  }
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

    // Check rate limit
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { firstName, lastName, latitude, longitude } = await req.json();

    if (!firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "First name and last name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const veriffApiKey = Deno.env.get("VERIFF_API_KEY");
    if (!veriffApiKey) {
      console.error("[ERROR] Missing VERIFF_API_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Veriff session
    const veriffResponse = await fetch("https://stationapi.veriff.com/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": veriffApiKey,
      },
      body: JSON.stringify({
        verification: {
          callback: `${Deno.env.get("SUPABASE_URL")}/functions/v1/veriff-webhook`,
          person: {
            firstName,
            lastName,
          },
          vendorData: new Date().toISOString(),
        },
      }),
    });

    if (!veriffResponse.ok) {
      const errorText = await veriffResponse.text();
      console.error("[ERROR] Veriff API error:", veriffResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create verification session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const veriffData = await veriffResponse.json();
    const sessionId = veriffData.verification?.id;
    const verificationUrl = veriffData.verification?.url;

    if (!sessionId || !verificationUrl) {
      console.error("[ERROR] Invalid Veriff response:", veriffData);
      return new Response(
        JSON.stringify({ error: "Invalid response from verification service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reverse geocode location if provided
    let city: string | undefined;
    let state: string | undefined;

    if (latitude && longitude) {
      const location = await reverseGeocode(latitude, longitude);
      city = location.city;
      state = location.state;
    }

    // Store verification record
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

    const { error: dbError } = await supabase.from("verifications").insert({
      session_id: sessionId,
      verification_url: verificationUrl,
      status: "created",
      first_name: firstName,
      last_name: lastName,
      latitude: latitude || null,
      longitude: longitude || null,
      city: city || null,
      state: state || null,
    });

    if (dbError) {
      console.error("[ERROR] Failed to store verification:", dbError);
      // Continue anyway - the verification session was created
    }

    console.log(`[INFO] Verification session created: ${sessionId} for ${firstName} ${lastName}`);

    return new Response(
      JSON.stringify({
        sessionId,
        url: verificationUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ERROR] Create verification session error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
