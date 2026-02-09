import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { BrandingSettings } from '@/types/branding';
import { getBranding } from '@/lib/api';

interface BrandingContextType {
  branding: BrandingSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

/**
 * Provider that fetches and shares branding settings across the app
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranding();
      setBranding(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  // Apply branding to document
  useEffect(() => {
    if (!branding) return;

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primary_color);
    root.style.setProperty('--brand-secondary', branding.secondary_color);
    root.style.setProperty('--brand-text', branding.text_color);
    root.style.setProperty('--brand-button', branding.button_color);
    root.style.setProperty('--brand-button-text', branding.button_text_color);
    root.style.setProperty('--brand-badge', branding.badge_color);
    root.style.setProperty('--brand-highlight', branding.highlight_text_color);

    // Load Google Font
    if (branding.font_family && branding.font_family !== 'Inter') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${branding.font_family.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      root.style.setProperty('--font-family', `"${branding.font_family}", sans-serif`);
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding, loading, error, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

/**
 * Hook to access branding settings
 */
export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
