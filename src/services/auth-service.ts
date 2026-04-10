import { apiClient } from '@/lib/api-client';

// Mock implementations for auth services.
// In a real app, these would make API calls to your backend.

async function login(email: string, password: string): Promise<any> {
  console.log('Logging in with', { email, password });
  // MOCK: Simulate API call
  if (email && password) {
    // In a real app, you'd get user data and a token from the server
    return Promise.resolve({
      token: 'mock-jwt-token-string',
      user: { id: 'user-123', name: 'Demo User', email: email },
    });
  } else {
    return Promise.reject(new Error('Invalid email or password.'));
  }
}

async function register(data: { name: string, email: string, password: string }): Promise<any> {
  console.log('Registering with', data);
  // MOCK: Simulate API call
  if (data.email.includes('existing')) {
      return Promise.reject(new Error('An account with this email already exists.'));
  }
  return Promise.resolve({
    user: { id: 'user-124', name: data.name, email: data.email },
    message: 'Registration successful. Please check your email to verify your account.',
  });
}

async function forgotPassword(email: string): Promise<any> {
  console.log('Forgot password for', email);
  // MOCK: Simulate API call
  return Promise.resolve({ message: 'If an account with this email exists, a password reset link has been sent.' });
}

async function verifyOtp(otp: string): Promise<any> {
  console.log('Verifying OTP', otp);
  // MOCK: Simulate API call
  if (otp === '123456') {
    return Promise.resolve({ success: true, message: 'OTP verified successfully.' });
  } else {
    return Promise.reject(new Error('Invalid OTP.'));
  }
}

async function resetPassword(password: string, token: string): Promise<any> {
  console.log('Resetting password with token', token);
  // MOCK: Simulate API call
  if (password && token) {
    return Promise.resolve({ success: true, message: 'Your password has been reset successfully.' });
  } else {
    return Promise.reject(new Error('Invalid token or password.'));
  }
}

export const authService = {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
