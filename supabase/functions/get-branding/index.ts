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
