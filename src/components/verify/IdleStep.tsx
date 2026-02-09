import { useBranding } from '@/contexts/BrandingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface IdleStepProps {
  onStart: () => void;
}

/**
 * Initial welcome screen with branding and start button
 */
export function IdleStep({ onStart }: IdleStepProps) {
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
        {/* Company Logo */}
        {branding.logo_url && (
          <div className="flex justify-center">
            <img
              src={branding.logo_url}
              alt={branding.company_name}
              className="max-h-24 w-auto"
            />
          </div>
        )}

        {/* Company Name */}
        <h1
          className="text-3xl font-bold"
          style={{ color: branding.text_color }}
        >
          {branding.company_name}
        </h1>

        {/* Welcome Message */}
        <p
          className="text-lg"
          style={{ color: branding.text_color }}
        >
          Welcome to our identity verification portal. Click below to begin the verification process.
        </p>

        {/* Start Button */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full"
          style={{
            backgroundColor: branding.button_color,
            color: branding.button_text_color,
          }}
        >
          Start Verification
        </Button>

        {/* Privacy Policy Link */}
        {branding.privacy_policy_url && (
          <a
            href={branding.privacy_policy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
            style={{ color: branding.highlight_text_color }}
          >
            Privacy Policy
          </a>
        )}
      </Card>
    </div>
  );
}
