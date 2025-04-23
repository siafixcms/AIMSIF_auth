import bcrypt from 'bcryptjs';
import { mockClientService } from './__mocks__/mockClientService';
import * as redis from './db/redis';

export async function createPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function authenticate(email: string, password: string): Promise<{ success: boolean }> {
  const client = await mockClientService.getClientByEmail(email);
  if (!client) {
    throw new Error('Client not found');
  }

  const isValid = await bcrypt.compare(password, client.passwordHash);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  return { success: true };
}

export async function verify2FA(email: string, code: string): Promise<boolean> {
  const key = `2fa:${email}`;
  const expectedCode = await redis.get(key);
  return expectedCode === code;
}
