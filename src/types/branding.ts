/**
 * Branding settings for white-label customization
 */
export interface BrandingSettings {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  badge_color: string;
  highlight_text_color: string;
  font_family: string;
  privacy_policy_url: string | null;
  background_video_url: string | null;
  background_image_url: string | null;
  content_overlay_color: string;
  content_overlay_opacity: number;
  location_services_enabled: boolean;
  next_steps_title: string;
  next_steps_description: string;
  next_steps_box_color: string;
  next_steps_text_color: string;
}

/**
 * Partial branding update payload
 */
export type BrandingUpdate = Partial<Omit<BrandingSettings, 'id' | 'created_at' | 'updated_at'>>;
