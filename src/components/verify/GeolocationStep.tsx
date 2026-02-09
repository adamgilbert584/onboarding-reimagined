import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateVerificationPayload } from '@/types/verification';

interface GeolocationStepProps {
  onSubmit: (data: CreateVerificationPayload) => void;
}

/**
 * Form to collect user name and location data
 */
export function GeolocationStep({ onSubmit }: GeolocationStepProps) {
  const { branding } = useBranding();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  if (!branding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) return;

    // Get location if enabled
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (branding.location_services_enabled) {
      setGettingLocation(true);
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (err) {
        console.error('Failed to get location:', err);
      }
      setGettingLocation(false);
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      latitude,
      longitude,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md p-8"
        style={{
          backgroundColor: branding.secondary_color,
          color: branding.text_color,
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: branding.text_color }}
          >
            Your Information
          </h2>

          <p className="text-center" style={{ color: branding.text_color }}>
            Please provide your name to begin verification.
          </p>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
            />
          </div>

          {/* Location Notice */}
          {branding.location_services_enabled && (
            <p className="text-sm text-center" style={{ color: branding.text_color }}>
              Your location will be captured for verification purposes.
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!firstName.trim() || !lastName.trim() || gettingLocation}
            style={{
              backgroundColor: branding.button_color,
              color: branding.button_text_color,
            }}
          >
            {gettingLocation ? 'Getting Location...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
