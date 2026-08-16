/**
 * Utility for logging detailed debug errors while returning non-technical, user-friendly messages for the UI.
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong while processing your request. Please try again in a few moments.',
): string {
  // 1. Always log raw error details for developer debugging
  if (error) {
    console.error('[Health AI Diagnostic Log]:', error);
  }

  if (!error) return fallback;

  // 2. Handle string errors
  if (typeof error === 'string') {
    return formatUserFriendlyMessage(error, fallback);
  }

  // 3. Handle Axios or Object errors
  if (typeof error === 'object' && error !== null) {
    const errObj = error as {
      response?: {
        status?: number;
        data?: {
          error?: { code?: string; message?: string };
          message?: string;
        };
      };
      code?: string;
      message?: string;
    };

    const status = errObj.response?.status;
    const rawCode = errObj.response?.data?.error?.code || errObj.code || '';
    const rawMsg =
      errObj.response?.data?.error?.message ||
      errObj.response?.data?.message ||
      errObj.message ||
      '';

    // Handle Network & Offline errors
    if (
      rawCode === 'ERR_NETWORK' ||
      rawMsg.toLowerCase().includes('network error') ||
      rawMsg.toLowerCase().includes('failed to fetch')
    ) {
      return 'Unable to connect to Health AI server. Please check your internet connection and try again.';
    }

    // Handle HTTP status code mappings to friendly patient messages
    if (status === 401 || rawCode === 'UNAUTHORIZEDERROR') {
      return 'Your session has expired. Please log in again to access your patient portal.';
    }
    if (status === 403 || rawCode === 'FORBIDDENERROR') {
      return 'You do not have permission to access this section.';
    }
    if (status === 404 || rawCode === 'NOTFOUNDERROR') {
      return 'We could not find your health record. Please refresh or contact support if the issue persists.';
    }
    if (status === 409 || rawCode === 'CONFLICTERROR') {
      return 'An account with this email address already exists. Please try signing in instead.';
    }
    if (status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (status && status >= 500) {
      return 'Our servers are experiencing temporary technical difficulties. Please try again shortly.';
    }

    if (rawMsg) {
      return formatUserFriendlyMessage(rawMsg, fallback);
    }
  }

  return fallback;
}

/**
 * Translates raw backend/database message strings into clean, user-comprehensible text.
 */
function formatUserFriendlyMessage(rawMsg: string, fallback: string): string {
  const msgLower = rawMsg.toLowerCase();

  if (msgLower.includes('jwt') || msgLower.includes('token') || msgLower.includes('unauthorized')) {
    return 'Your session has expired. Please log in again to access your patient portal.';
  }
  if (msgLower.includes('not found') || msgLower.includes('user record not found')) {
    return 'We could not find your health record. Please refresh or contact support if the issue persists.';
  }
  if (
    msgLower.includes('duplicate') ||
    msgLower.includes('already exists') ||
    msgLower.includes('conflict')
  ) {
    return 'An account with this email address already exists. Please try signing in instead.';
  }
  if (msgLower.includes('invalid credentials') || msgLower.includes('password mismatch')) {
    return 'Incorrect email or password. Please check your details and try again.';
  }
  if (msgLower.includes('otp') || msgLower.includes('verification code')) {
    return 'The verification code entered is incorrect or expired. Please request a new code.';
  }
  if (msgLower.includes('network') || msgLower.includes('econnrefused')) {
    return 'Unable to connect to Health AI server. Please check your internet connection and try again.';
  }

  // If the raw message is clean user text without code symbols, return it directly
  if (!/[_{}[\]\\]/.test(rawMsg) && rawMsg.length > 5 && rawMsg.length < 150) {
    return rawMsg;
  }

  return fallback;
}
