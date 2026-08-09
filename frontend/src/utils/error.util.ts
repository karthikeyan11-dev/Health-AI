/**
 * Safe error message extraction from Axios or standard Error objects.
 */

export function extractErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (typeof error === 'object' && error !== null) {
    // Axios error response
    const errObj = error as {
      response?: { data?: { error?: { message?: string }; message?: string } };
      message?: string;
    };
    if (errObj.response?.data?.error?.message) {
      return errObj.response.data.error.message;
    }
    if (errObj.response?.data?.message) {
      return errObj.response.data.message;
    }
    if (errObj.message) {
      return errObj.message;
    }
  }

  return fallback;
}
