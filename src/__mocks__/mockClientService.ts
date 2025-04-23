type Client = {
  email: string;
  passwordHash: string;
};

const mockDB: Record<string, Client> = {};

export const mockClientService = {
  getClientByEmail: async (email: string): Promise<Client | null> => {
    return mockDB[email] || null;
  },

  mockResolvedValueOnce: (data: Client) => {
    mockDB[data.email] = data;
  },

  reset: () => {
    Object.keys(mockDB).forEach(key => delete mockDB[key]);
  }
};
