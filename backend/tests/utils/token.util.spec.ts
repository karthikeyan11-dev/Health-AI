import { generateTokens } from '../../src/shared/utils/token.util';

describe('token.util Unit Tests', () => {
  it('should generate valid access and refresh tokens with Bearer type and 3600 expiresIn', () => {
    const payload = {
      userId: 'user_12345',
      email: 'test@example.com',
      role: 'PATIENT',
    };

    const tokens = generateTokens(payload);

    expect(tokens).toBeDefined();
    expect(tokens.accessToken).toBeDefined();
    expect(typeof tokens.accessToken).toBe('string');
    expect(tokens.refreshToken).toBeDefined();
    expect(typeof tokens.refreshToken).toBe('string');
    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.expiresIn).toBe(3600);
  });
});
