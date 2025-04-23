// __tests__/auth/auth.service.integration.test.ts

import bcrypt from 'bcrypt';
import { createPassword, authenticate, verify2FA } from '../../src/service';
import { mockClientService } from '../__mocks__/mockClientService';

describe('Auth Service Integration', () => {
  const email = 'test@example.com';
  const password = 'password123';
  let passwordHash: string;

  beforeEach(async () => {
    mockClientService.reset();
    passwordHash = await bcrypt.hash(password, 10);
  });

  it('creates a hashed password', async () => {
    const result = await createPassword(password);
    const match = await bcrypt.compare(password, result);
    expect(match).toBe(true);
  });

  it('authenticates with valid email and password', async () => {
    mockClientService.registerClient({ email, passwordHash });
    const result = await authenticate(email, password);
    expect(result.success).toBe(true);
  });

  it('fails authentication for nonexistent user', async () => {
    const result = await authenticate('fake@example.com', 'wrong');
    expect(result.success).toBe(false);
  });

  it('fails authentication for wrong password', async () => {
    mockClientService.registerClient({ email, passwordHash });
    const result = await authenticate(email, 'wrongpassword');
    expect(result.success).toBe(false);
  });

  it('verifies correct 2FA code', async () => {
    const code = '123456';
    const result = await verify2FA(email, code);
    expect(result).toEqual({ success: true });
  });

  it('rejects incorrect 2FA code', async () => {
    const result = await verify2FA(email, '000000');
    expect(result).toEqual({ success: false });
  });
});
