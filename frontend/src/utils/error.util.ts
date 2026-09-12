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
      if (
        rawMsg.toLowerCase().includes('credential') ||
        rawMsg.toLowerCase().includes('password') ||
        rawMsg.toLowerCase().includes('login')
      ) {
        return 'Incorrect email or password. Please check your details and try again.';
      }
      return 'Your session has expired. Please log in again to access your patient portal.';
    }
    if (status === 403 || rawCode === 'FORBIDDENERROR') {
      return 'You do not have permission to access this section.';
    }
    if (status === 404 || rawCode === 'NOTFOUNDERROR') {
      if (
        fallback &&
        fallback !==
          'Something went wrong while processing your request. Please try again in a few moments.'
      ) {
        return fallback;
      }
      return 'The requested record or resource was not found. Please try again or contact support.';
    }
    if (status === 409 || rawCode === 'CONFLICTERROR') {
      if (rawMsg.toLowerCase().includes('email') || rawMsg.toLowerCase().includes('account')) {
        return 'An account with this email address already exists. Please try signing in instead.';
      }
      return 'A conflict occurred while processing your request. Please try again.';
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

  // Don't format generic Axios request failed messages as clean readable text
  if (msgLower.startsWith('request failed with status code')) {
    return fallback;
  }

  if (
    msgLower.includes('invalid credentials') ||
    msgLower.includes('password mismatch') ||
    msgLower.includes('incorrect password') ||
    msgLower.includes('wrong password') ||
    msgLower.includes('invalid email or password')
  ) {
    return 'Incorrect email or password. Please check your details and try again.';
  }

  if (msgLower.includes('account is disabled') || msgLower.includes('account disabled')) {
    return 'Your account has been disabled. Please contact support.';
  }

  if (
    msgLower.includes('jwt') ||
    msgLower.includes('token') ||
    msgLower.includes('session has expired') ||
    msgLower.includes('token is invalid') ||
    msgLower.includes('authentication required')
  ) {
    return 'Your session has expired. Please log in again to access your patient portal.';
  }

  if (msgLower.includes('user record not found') || msgLower.includes('user not found')) {
    return 'We could not find the specified user record.';
  }

  if (
    msgLower.includes('patient record not found') ||
    msgLower.includes('health record not found')
  ) {
    return 'We could not find your health record. Please refresh or contact support if the issue persists.';
  }

  if (
    msgLower.includes('duplicate') ||
    msgLower.includes('already exists') ||
    msgLower.includes('email registered')
  ) {
    return 'An account with this email address already exists. Please try signing in instead.';
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
