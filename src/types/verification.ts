/**
 * Verification record from database
 */
export interface Verification {
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  status: string;
  decision: string | null;
  reason: string | null;
  first_name: string | null;
  last_name: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
}

/**
 * Payload to create a new verification session
 */
export interface CreateVerificationPayload {
  firstName: string;
  lastName: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Response from creating a Veriff session
 */
export interface VeriffSessionResponse {
  sessionId: string;
  url: string;
}
