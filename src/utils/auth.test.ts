import { getUserIdFromToken } from './auth';

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({ id: '12345' }),
}));

describe('Auth Utils', () => {
  it('should return user ID from valid token', () => {
    const userId = getUserIdFromToken('fake-token');
    expect(userId).toBe('12345');
  });
});
