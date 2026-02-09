import { useState, useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { IdleStep } from '@/components/verify/IdleStep';
import { PermissionsStep } from '@/components/verify/PermissionsStep';
import { GeolocationStep } from '@/components/verify/GeolocationStep';
import { LoadingStep } from '@/components/verify/LoadingStep';
import { VeriffStep } from '@/components/verify/VeriffStep';
import { SubmittedStep } from '@/components/verify/SubmittedStep';
import type { CreateVerificationPayload } from '@/types/verification';

type VerificationStep = 'idle' | 'permissions' | 'geolocation' | 'loading' | 'veriff' | 'submitted';

/**
 * Main verification flow page with multi-step process
 */
export default function VerifyPage() {
  const { branding, loading } = useBranding();
  const [step, setStep] = useState<VerificationStep>('idle');
  const [verificationData, setVerificationData] = useState<CreateVerificationPayload | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string>('');

  // Show loading until branding is fetched
  if (loading || !branding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: branding.background_image_url
      ? `url(${branding.background_image_url})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen relative" style={backgroundStyle}>
      {/* Background Video */}
      {branding.background_video_url && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={branding.background_video_url} type="video/mp4" />
        </video>
      )}

      {/* Content Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: branding.content_overlay_color,
          opacity: branding.content_overlay_opacity,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {step === 'idle' && <IdleStep onStart={() => setStep('permissions')} />}

        {step === 'permissions' && (
          <PermissionsStep
            onGranted={() => setStep('geolocation')}
            onSkip={() => setStep('geolocation')}
          />
        )}

        {step === 'geolocation' && (
          <GeolocationStep
            onSubmit={(data) => {
              setVerificationData(data);
              setStep('loading');
            }}
          />
        )}

        {step === 'loading' && verificationData && (
          <LoadingStep
            data={verificationData}
            onSuccess={(url) => {
              setSessionUrl(url);
              setStep('veriff');
            }}
            onError={() => setStep('geolocation')}
          />
        )}

        {step === 'veriff' && sessionUrl && (
          <VeriffStep
            sessionUrl={sessionUrl}
            onComplete={() => setStep('submitted')}
          />
        )}

        {step === 'submitted' && <SubmittedStep />}
      </div>
    </div>
  );
}
