/**
 * Standard data validators for the VerifyCerts platform.
 * Ensuring data integrity before dispatching API requests.
 */

export const validators = {
  /**
   * Validates if the provided string is a valid email address.
   * Requires '@' and a domain with a '.' suffix.
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates password strength (minimum 6 characters).
   * Can be expanded for complexity requirements.
   */
  validatePassword: (password: string): boolean => {
    return password.length >= 6;
  },

  /**
   * General required field validation.
   */
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  }
};
