import bcrypt from 'bcryptjs';
import { getClientByEmail } from './__mocks__/mockClientService';

export async function createPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function authenticate(email: string, password: string): Promise<{ success: boolean }> {
  const client = await getClientByEmail(email);
  if (!client) {
    return { success: false };
  }

  const isValid = await bcrypt.compare(password, client.passwordHash);
  return { success: isValid };
}

export async function ping(): Promise<string> {
  return 'pong';
}

export async function verify2FA(email: string, code: string): Promise<{ success: boolean }> {
  const client = await getClientByEmail(email);
  if (!client || !client.twoFACode) {
    return { success: false };
  }

  return { success: client.twoFACode === code };
}

export async function sendMessage({ clientId, message }: { clientId: string, message: string }): Promise<string> {
  console.log(`Message for ${clientId}: ${message}`);
  return 'queued';
}