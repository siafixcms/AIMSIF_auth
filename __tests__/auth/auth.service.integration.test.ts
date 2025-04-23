// __tests__/integration/auth.service.integration.test.ts

/**
 * @capability auth.createPassword
 * @capability auth.verifyPassword
 * @capability auth.authenticate
 * @capability auth.verify2FA
 * @capability auth.validateClientEmail (via client service RPC)
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { createPassword, authenticate, verify2FA } from '../../src/service';
import { mockClientService } from '../mocks/mockClientService';
import * as redis from '../../src/db/redis'; // Assuming Redis is used for 2FA codes

jest.mock('../../src/client-rpc', () => ({
  getClientByEmail: jest.fn(mockClientService.getClientByEmail)
}));

jest.mock('../../src/db/redis');

describe('Auth Service Integration', () => {
  const testEmail = 'testuser@example.com';
  const password = 'S3cretP@ssw0rd';
  const hashedPassword = 'hashedMock'; // Simulated hash
  const twoFACode = '123456';

  beforeAll(() => {
    // Setup Redis or any other in-memory state if needed
    (redis.set as jest.Mock).mockResolvedValue('OK');
    (redis.get as jest.Mock).mockResolvedValue(twoFACode);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('Password Management', () => {
    it('should create a hashed password', async () => {
      const hash = await createPassword(password);
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });
  });

  describe('Client Email Validation', () => {
    it('should fail if client email does not exist in client service', async () => {
      mockClientService.getClientByEmail.mockResolvedValueOnce(undefined);

      await expect(authenticate('nonexistent@example.com', password)).rejects.toThrow(
        /Client not found/
      );
    });

    it('should succeed if client email is valid and password matches', async () => {
      mockClientService.getClientByEmail.mockResolvedValueOnce({
        email: testEmail,
        passwordHash: hashedPassword
      });

      const authResult = await authenticate(testEmail, password);
      expect(authResult).toEqual({ success: true });
    });

    it('should fail if password is incorrect', async () => {
      mockClientService.getClientByEmail.mockResolvedValueOnce({
        email: testEmail,
        passwordHash: 'invalidHash'
      });

      await expect(authenticate(testEmail, 'wrongPassword')).rejects.toThrow(/Invalid password/);
    });
  });

  describe('2FA Verification', () => {
    it('should verify a correct 2FA code from Redis', async () => {
      const verified = await verify2FA(testEmail, twoFACode);
      expect(verified).toBe(true);
    });

    it('should reject an invalid 2FA code', async () => {
      (redis.get as jest.Mock).mockResolvedValueOnce('654321');
      const verified = await verify2FA(testEmail, '000000');
      expect(verified).toBe(false);
    });
  });
});
