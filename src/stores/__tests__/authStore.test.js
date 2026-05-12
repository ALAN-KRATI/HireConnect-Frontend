import { renderHook, act } from '@testing-library/react';
import useAuthStore from '../authStore';

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  // Clear store state between tests
  const { result } = renderHook(() => useAuthStore());
  act(() => {
    result.current.logout();
  });
});

describe('useAuthStore', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      token: 'fake-token',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password',
      }),
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.token).toBe(mockResponse.token);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle login failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Login failed');
  });

  it('should set loading state during login', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'fake-token',
      }),
    });

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should logout correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    // First set authenticated state
    act(() => {
      result.current.setUser({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.error = 'Some error';
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should set user correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    const user = { id: 1, email: 'test@example.com', name: 'Test User' };

    act(() => {
      result.current.setUser(user);
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });
});