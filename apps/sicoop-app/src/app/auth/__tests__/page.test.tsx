import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AuthPage from '../page';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve redirecionar para /auth/login', () => {
    render(<AuthPage />);

    expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
  });

  it('deve chamar redirect apenas uma vez', () => {
    render(<AuthPage />);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});
