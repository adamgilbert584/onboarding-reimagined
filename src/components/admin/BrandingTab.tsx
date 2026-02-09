import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { updateBranding, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { BrandingUpdate } from '@/types/branding';
import { toast } from 'sonner';
import { Eye, Upload } from 'lucide-react';

/**
 * Branding customization tab with color pickers and file uploads
 */
export function BrandingTab() {
  const { token } = useAuth();
  const { branding, refetch } = useBranding();
  const [formData, setFormData] = useState<BrandingUpdate>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Initialize form with current branding
  useEffect(() => {
    if (branding) {
      setFormData({
        company_name: branding.company_name,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        text_color: branding.text_color,
        button_color: branding.button_color,
        button_text_color: branding.button_text_color,
        badge_color: branding.badge_color,
        highlight_text_color: branding.highlight_text_color,
        font_family: branding.font_family,
        logo_url: branding.logo_url,
        privacy_policy_url: branding.privacy_policy_url,
        background_video_url: branding.background_video_url,
        background_image_url: branding.background_image_url,
        content_overlay_color: branding.content_overlay_color,
        content_overlay_opacity: branding.content_overlay_opacity,
        location_services_enabled: branding.location_services_enabled,
        next_steps_title: branding.next_steps_title,
        next_steps_description: branding.next_steps_description,
        next_steps_box_color: branding.next_steps_box_color,
        next_steps_text_color: branding.next_steps_text_color,
      });
    }
  }, [branding]);

  const handleFileUpload = async (file: File, bucket: 'logos' | 'backgrounds', field: keyof BrandingUpdate) => {
    if (!token) return;

    setUploading(field);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const response = await uploadFile(file, bucket, fileName, token);
      setFormData((prev) => ({ ...prev, [field]: response.url }));
      toast.success('File uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      await updateBranding(formData, token);
      await refetch();
      toast.success('Branding updated successfully');
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/verify', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Branding Settings</h2>
          <div className="flex gap-3">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Company Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_upload">Company Logo</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="logo_upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logos', 'logo_url');
                    }}
                    disabled={uploading === 'logo_url'}
                  />
                  {uploading === 'logo_url' && <span className="text-sm">Uploading...</span>}
                </div>
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="max-h-16 mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                <Input
                  id="privacy_policy_url"
                  type="url"
                  value={formData.privacy_policy_url || ''}
                  onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Colors */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Colors</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorInput
                label="Primary Color"
                value={formData.primary_color || '#1e3a5f'}
                onChange={(value) => setFormData({ ...formData, primary_color: value })}
              />
              <ColorInput
                label="Secondary Color"
                value={formData.secondary_color || '#f8fafc'}
                onChange={(value) => setFormData({ ...formData, secondary_color: value })}
              />
              <ColorInput
                label="Text Color"
                value={formData.text_color || '#1e293b'}
                onChange={(value) => setFormData({ ...formData, text_color: value })}
              />
              <ColorInput
                label="Button Color"
                value={formData.button_color || '#1e3a5f'}
                onChange={(value) => setFormData({ ...formData, button_color: value })}
              />
              <ColorInput
                label="Button Text Color"
                value={formData.button_text_color || '#ffffff'}
                onChange={(value) => setFormData({ ...formData, button_text_color: value })}
              />
              <ColorInput
                label="Badge Color"
                value={formData.badge_color || '#ffffff'}
                onChange={(value) => setFormData({ ...formData, badge_color: value })}
              />
              <ColorInput
                label="Highlight Text Color"
                value={formData.highlight_text_color || '#3b82f6'}
                onChange={(value) => setFormData({ ...formData, highlight_text_color: value })}
              />
            </div>
          </section>

          <Separator />

          {/* Font */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Typography</h3>
            <div className="space-y-2">
              <Label htmlFor="font_family">Font Family (Google Fonts)</Label>
              <Input
                id="font_family"
                value={formData.font_family || 'Inter'}
                onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                placeholder="Inter, Roboto, Open Sans, etc."
              />
            </div>
          </section>

          <Separator />

          {/* Background */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Background</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="bg_video">Background Video</Label>
                <Input
                  id="bg_video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'backgrounds', 'background_video_url');
                  }}
                  disabled={uploading === 'background_video_url'}
                />
                {uploading === 'background_video_url' && <span className="text-sm">Uploading...</span>}
                {formData.background_video_url && (
                  <a href={formData.background_video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                    View current video
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bg_image">Background Image (fallback)</Label>
                <Input
                  id="bg_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'backgrounds', 'background_image_url');
                  }}
                  disabled={uploading === 'background_image_url'}
                />
                {uploading === 'background_image_url' && <span className="text-sm">Uploading...</span>}
                {formData.background_image_url && (
                  <img src={formData.background_image_url} alt="Background" className="max-h-32 mt-2" />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <ColorInput
                  label="Overlay Color"
                  value={formData.content_overlay_color || '#000000'}
                  onChange={(value) => setFormData({ ...formData, content_overlay_color: value })}
                />
                <div className="space-y-2">
                  <Label htmlFor="overlay_opacity">Overlay Opacity</Label>
                  <Input
                    id="overlay_opacity"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.content_overlay_opacity || 0}
                    onChange={(e) => setFormData({ ...formData, content_overlay_opacity: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Location Services */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Location Services</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="location_enabled"
                checked={formData.location_services_enabled ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, location_services_enabled: checked })}
              />
              <Label htmlFor="location_enabled">Enable Location Collection</Label>
            </div>
          </section>

          <Separator />

          {/* Next Steps */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Next Steps Customization</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="next_steps_title">Title</Label>
                <Input
                  id="next_steps_title"
                  value={formData.next_steps_title || ''}
                  onChange={(e) => setFormData({ ...formData, next_steps_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_steps_description">Description</Label>
                <Textarea
                  id="next_steps_description"
                  value={formData.next_steps_description || ''}
                  onChange={(e) => setFormData({ ...formData, next_steps_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <ColorInput
                  label="Box Background Color"
                  value={formData.next_steps_box_color || '#1e3a5f'}
                  onChange={(value) => setFormData({ ...formData, next_steps_box_color: value })}
                />
                <ColorInput
                  label="Box Text Color"
                  value={formData.next_steps_text_color || '#ffffff'}
                  onChange={(value) => setFormData({ ...formData, next_steps_text_color: value })}
                />
              </div>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
