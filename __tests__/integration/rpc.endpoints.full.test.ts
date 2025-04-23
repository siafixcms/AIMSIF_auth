// __tests__/integration/rpc.endpoints.full.test.ts

import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { TestClient } from '../../utils/testClient';
import dotenv from 'dotenv';

dotenv.config();

let serverProcess: ChildProcessWithoutNullStreams;
let client: TestClient;

beforeAll((done) => {
  const serverPath = path.resolve(__dirname, '../../src/server.ts');
  serverProcess = spawn('ts-node', [serverPath]);

  serverProcess.stdout?.on('data', (data) => {
    if (data.toString().includes('Server is running')) {
      const port = process.env.PORT || '7885';
      client = new TestClient(`ws://localhost:${port}`);
      client.connect().then(done);
    }
  });

  serverProcess.stderr?.on('data', (err) => {
    console.error(`[stderr]: ${err}`);
  });
});

afterAll(() => {
  client.close();
  serverProcess.kill();
});

describe('Auth Service RPC Endpoint Coverage', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'S3cretP@ssw0rd';
  const test2FACode = '123456';

  it('calls ping()', async () => {
    const result = await client.call('ping');
    expect(result).toBe('pong');
  });

  it('creates a password with createPassword()', async () => {
    const result = await client.call('createPassword', testPassword);
    expect(result).toEqual({ success: true });
  });

  it('authenticates user with authenticate()', async () => {
    const result = await client.call('authenticate', {
      email: testEmail,
      password: testPassword,
    });
    expect(result).toEqual({ success: true });
  });

  it('verifies 2FA code with verify2FA()', async () => {
    const result = await client.call('verify2FA', {
      email: testEmail,
      code: test2FACode,
    });
    expect(result).toEqual({ success: true });
  });
});
