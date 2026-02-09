import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Card } from '@/components/ui/card';
import { createVerificationSession } from '@/lib/api';
import type { CreateVerificationPayload } from '@/types/verification';
import { toast } from 'sonner';

interface LoadingStepProps {
  data: CreateVerificationPayload;
  onSuccess: (url: string) => void;
  onError: () => void;
}

/**
 * Creates Veriff session via API
 */
export function LoadingStep({ data, onSuccess, onError }: LoadingStepProps) {
  const { branding } = useBranding();

  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await createVerificationSession(data);
        onSuccess(response.url);
      } catch (err) {
        console.error('Failed to create session:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to create verification session');
        setTimeout(onError, 2000);
      }
    };

    createSession();
  }, [data, onSuccess, onError]);

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
        <div className="flex justify-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2"
            style={{ borderColor: branding.primary_color }}
          />
        </div>

        <h2
          className="text-2xl font-bold"
          style={{ color: branding.text_color }}
        >
          Preparing Verification
        </h2>

        <p style={{ color: branding.text_color }}>
          Please wait while we set up your verification session...
        </p>
      </Card>
    </div>
  );
}
