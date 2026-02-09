import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Camera, Mic, MapPin } from 'lucide-react';

interface PermissionsStepProps {
  onGranted: () => void;
  onSkip: () => void;
}

/**
 * Request browser permissions for camera, microphone, and location
 */
export function PermissionsStep({ onGranted, onSkip }: PermissionsStepProps) {
  const { branding } = useBranding();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!branding) return null;

  const requestPermissions = async () => {
    setRequesting(true);

    try {
      // Request camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraGranted(true);
      setMicGranted(true);
    } catch (err) {
      console.error('Camera/mic permission denied:', err);
    }

    // Request location if enabled
    if (branding.location_services_enabled) {
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setLocationGranted(true);
              resolve();
            },
            reject,
            { timeout: 10000 }
          );
        });
      } catch (err) {
        console.error('Location permission denied:', err);
      }
    } else {
      setLocationGranted(true); // Skip if not required
    }

    setRequesting(false);
  };

  const allGranted = cameraGranted && micGranted && locationGranted;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md p-8 space-y-6"
        style={{
          backgroundColor: branding.secondary_color,
          color: branding.text_color,
        }}
      >
        <h2
          className="text-2xl font-bold text-center"
          style={{ color: branding.text_color }}
        >
          Permissions Required
        </h2>

        <p className="text-center" style={{ color: branding.text_color }}>
          We need access to your camera, microphone, and location to complete the verification process.
        </p>

        {/* Permission Items */}
        <div className="space-y-4">
          <PermissionItem
            icon={<Camera className="w-5 h-5" />}
            label="Camera Access"
            granted={cameraGranted}
          />
          <PermissionItem
            icon={<Mic className="w-5 h-5" />}
            label="Microphone Access"
            granted={micGranted}
          />
          {branding.location_services_enabled && (
            <PermissionItem
              icon={<MapPin className="w-5 h-5" />}
              label="Location Access"
              granted={locationGranted}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={allGranted ? onGranted : requestPermissions}
            disabled={requesting}
            size="lg"
            className="w-full"
            style={{
              backgroundColor: branding.button_color,
              color: branding.button_text_color,
            }}
          >
            {requesting ? 'Requesting...' : allGranted ? 'Continue' : 'Grant Permissions'}
          </Button>

          <Button
            onClick={onSkip}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PermissionItem({ icon, label, granted }: { icon: React.ReactNode; label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {granted ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-400" />
      )}
    </div>
  );
}
