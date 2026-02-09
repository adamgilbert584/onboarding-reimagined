import { useBranding } from '@/contexts/BrandingContext';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

/**
 * Final confirmation screen with customizable next steps message
 */
export function SubmittedStep() {
  const { branding } = useBranding();

  if (!branding) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md p-8 space-y-6 text-center"
        style={{
          backgroundColor: branding.secondary_color,
          color: branding.text_color,
        }}
      >
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle2
            className="w-20 h-20"
            style={{ color: branding.primary_color }}
          />
        </div>

        {/* Thank You Message */}
        <h2
          className="text-3xl font-bold"
          style={{ color: branding.text_color }}
        >
          Thank You!
        </h2>

        <p
          className="text-lg"
          style={{ color: branding.text_color }}
        >
          Your verification has been submitted successfully.
        </p>

        {/* Next Steps Box */}
        <div
          className="rounded-lg p-6 space-y-3"
          style={{
            backgroundColor: branding.next_steps_box_color,
            color: branding.next_steps_text_color,
          }}
        >
          <h3 className="text-xl font-semibold">
            {branding.next_steps_title}
          </h3>
          <p className="text-base">
            {branding.next_steps_description}
          </p>
        </div>
      </Card>
    </div>
  );
}
