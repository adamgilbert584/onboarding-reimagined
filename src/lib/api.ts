import { getFunctionsUrl } from './supabase';
import type { BrandingSettings, BrandingUpdate } from '@/types/branding';
import type { CreateVerificationPayload, Verification, VeriffSessionResponse } from '@/types/verification';

const functionsUrl = getFunctionsUrl();

/**
 * Fetch branding settings from the API
 */
export async function getBranding(): Promise<BrandingSettings> {
  const response = await fetch(`${functionsUrl}/get-branding`);
  if (!response.ok) {
    throw new Error('Failed to fetch branding settings');
  }
  return response.json();
}

/**
 * Update branding settings (requires admin JWT)
 */
export async function updateBranding(branding: BrandingUpdate, token: string): Promise<void> {
  const response = await fetch(`${functionsUrl}/update-branding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ branding }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update branding');
  }
}

/**
 * Upload a file to storage (requires admin JWT)
 */
export async function uploadFile(
  file: File,
  bucket: 'logos' | 'backgrounds',
  fileName: string,
  token: string
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('fileName', fileName);

  const response = await fetch(`${functionsUrl}/upload-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
}

/**
 * Admin login
 */
export async function adminLogin(password: string): Promise<{ token: string }> {
  const response = await fetch(`${functionsUrl}/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

/**
 * Create a new Veriff verification session
 */
export async function createVerificationSession(
  payload: CreateVerificationPayload
): Promise<VeriffSessionResponse> {
  const response = await fetch(`${functionsUrl}/create-veriff-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create verification session');
  }

  return response.json();
}

/**
 * Fetch all verification records (requires admin JWT)
 */
export async function getVerifications(token: string): Promise<Verification[]> {
  const response = await fetch(`${functionsUrl}/get-verifications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch verifications');
  }

  const data = await response.json();
  return data.verifications;
}
