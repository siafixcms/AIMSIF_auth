import { createPassword, authenticate, verify2FA } from '../../src/service';
import { mockClientService } from '../../src/__mocks__/mockClientService';
import * as redis from '../../src/db/redis';

describe('Auth Service Integration', () => {
  beforeEach(() => {
    mockClientService.reset();
    redis.reset();
  });

  it('creates a hashed password', async () => {
    const plain = 'password123';
    const hash = await createPassword(plain);
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(plain);
  });

  it('authenticates with valid email and password', async () => {
    const email = 'user@example.com';
    const password = 'securepass';
    const passwordHash = await createPassword(password);

    mockClientService.mockResolvedValueOnce({ email, passwordHash });

    const result = await authenticate(email, password);
    expect(result.success).toBe(true);
  });

  it('fails authentication for nonexistent user', async () => {
    await expect(authenticate('noone@nowhere.com', 'whatever')).rejects.toThrow('Client not found');
  });

  it('fails authentication for wrong password', async () => {
    const email = 'user@example.com';
    const passwordHash = await createPassword('realpass');

    mockClientService.mockResolvedValueOnce({ email, passwordHash });

    await expect(authenticate(email, 'wrongpass')).rejects.toThrow('Invalid password');
  });

  it('verifies correct 2FA code', async () => {
    const email = 'twofa@example.com';
    const code = '123456';
    await redis.set(`2fa:${email}`, code);

    const result = await verify2FA(email, code);
    expect(result).toBe(true);
  });

  it('rejects incorrect 2FA code', async () => {
    const email = 'twofa@example.com';
    await redis.set(`2fa:${email}`, '654321');

    const result = await verify2FA(email, '000000');
    expect(result).toBe(false);
  });
});
