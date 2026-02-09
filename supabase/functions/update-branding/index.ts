import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { verifyToken, extractBearerToken } from "../_shared/jwt.ts";

// Rate limiting
const updateAttempts = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = updateAttempts.get(ip) || [];

  // Remove attempts older than 1 minute
  const recentAttempts = attempts.filter(time => now - time < 60000);

  if (recentAttempts.length >= 10) {
    return false;
  }

  recentAttempts.push(now);
  updateAttempts.set(ip, recentAttempts);
  return true;
}

function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeString(str: string, maxLength = 500): string {
  return str.trim().slice(0, maxLength);
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

    // Verify JWT token
    const authHeader = req.headers.get("authorization");
    const token = extractBearerToken(authHeader);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwtSecret = Deno.env.get("JWT_SECRET");
    if (!jwtSecret) {
      console.error("[ERROR] Missing JWT_SECRET");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verification = await verifyToken(token, jwtSecret);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({ error: verification.error || "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { branding } = await req.json();

    if (!branding || typeof branding !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize inputs
    const updates: Record<string, any> = {};

    if (branding.company_name !== undefined) {
      updates.company_name = sanitizeString(branding.company_name, 100);
    }

    // Validate color fields
    const colorFields = [
      "primary_color",
      "secondary_color",
      "text_color",
      "button_color",
      "button_text_color",
      "badge_color",
      "highlight_text_color",
      "content_overlay_color",
      "next_steps_box_color",
      "next_steps_text_color",
    ];

    for (const field of colorFields) {
      if (branding[field] !== undefined) {
        if (!validateHexColor(branding[field])) {
          return new Response(
            JSON.stringify({ error: `Invalid color format for ${field}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        updates[field] = branding[field];
      }
    }

    // Validate URL fields
    const urlFields = ["logo_url", "privacy_policy_url", "background_video_url", "background_image_url"];
    for (const field of urlFields) {
      if (branding[field] !== undefined) {
        if (branding[field] && !validateUrl(branding[field])) {
          return new Response(
            JSON.stringify({ error: `Invalid URL format for ${field}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        updates[field] = branding[field] || null;
      }
    }

    // Validate numeric fields
    if (branding.content_overlay_opacity !== undefined) {
      const opacity = parseFloat(branding.content_overlay_opacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        return new Response(
          JSON.stringify({ error: "Opacity must be between 0 and 1" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updates.content_overlay_opacity = opacity;
    }

    // Validate boolean fields
    if (branding.location_services_enabled !== undefined) {
      updates.location_services_enabled = Boolean(branding.location_services_enabled);
    }

    // Validate text fields
    if (branding.font_family !== undefined) {
      updates.font_family = sanitizeString(branding.font_family, 50);
    }

    if (branding.next_steps_title !== undefined) {
      updates.next_steps_title = sanitizeString(branding.next_steps_title, 100);
    }

    if (branding.next_steps_description !== undefined) {
      updates.next_steps_description = sanitizeString(branding.next_steps_description, 1000);
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    updates.updated_at = new Date().toISOString();

    // Update database
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

    const { error } = await supabase
      .from("branding_settings")
      .update(updates)
      .eq("id", (await supabase.from("branding_settings").select("id").limit(1).single()).data?.id);

    if (error) {
      console.error("[ERROR] Failed to update branding:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update branding settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[INFO] Branding updated by admin from IP: ${clientIP}`);

    return new Response(
      JSON.stringify({ success: true, message: "Branding updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ERROR] Update branding error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
