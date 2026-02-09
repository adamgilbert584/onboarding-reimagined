import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Card } from '@/components/ui/card';
import { createVeriffFrame } from '@veriff/incontext-sdk';

interface VeriffStepProps {
  sessionUrl: string;
  onComplete: () => void;
}

/**
 * Embeds Veriff SDK for ID verification
 */
export function VeriffStep({ sessionUrl, onComplete }: VeriffStepProps) {
  const { branding } = useBranding();

  useEffect(() => {
    const veriff = createVeriffFrame({
      url: sessionUrl,
      onEvent: (event) => {
        if (event === 'FINISHED') {
          onComplete();
        }
      },
    });

    return () => {
      // Cleanup if needed
    };
  }, [sessionUrl, onComplete]);

  if (!branding) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className="w-full max-w-4xl p-8 space-y-6 text-center"
        style={{
          backgroundColor: branding.secondary_color,
          color: branding.text_color,
        }}
      >
        <h2
          className="text-2xl font-bold"
          style={{ color: branding.text_color }}
        >
          Identity Verification
        </h2>

        <p style={{ color: branding.text_color }}>
          Please complete the verification process in the modal that appears.
        </p>

        <div id="veriff-root" className="min-h-[400px]" />
      </Card>
    </div>
  );
}
