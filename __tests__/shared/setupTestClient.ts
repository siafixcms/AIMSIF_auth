// __tests__/shared/setupTestClient.ts

import bcrypt from 'bcrypt';
import { mockClientService } from '../../src/__mocks__/mockClientService';

type SetupOptions = {
  email?: string;
  password?: string;
};

export async function setupTestClient({
  email = 'testuser@example.com',
  password = 'S3cretP@ssw0rd',
}: SetupOptions = {}) {
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Register the client
  mockClientService.registerClient({
    email,
    passwordHash,
  });

  return {
    email,
    password,
    passwordHash,
  };
}
