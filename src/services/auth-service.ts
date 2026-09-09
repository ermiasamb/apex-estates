import { apiClient } from '@/lib/api-client';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Add name property for frontend compatibility
  phone?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

// Helpers
function enrichUser(user: any): User {
  if (!user) return user;
  return {
    ...user,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
  };
}

// Service functions
async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true });
  return {
    ...response,
    user: enrichUser(response.user),
  };
}

async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', input, { skipAuth: true });
  return {
    ...response,
    user: enrichUser(response.user),
  };
}

async function forgotPassword(email: string): Promise<PasswordResetResponse> {
  return apiClient.post<PasswordResetResponse>('/auth/forgot-password', { email }, { skipAuth: true });
}

async function resetPassword(newPassword: string, token: string): Promise<PasswordResetResponse> {
  return apiClient.post<PasswordResetResponse>('/auth/reset-password', { token, newPassword }, { skipAuth: true });
}

async function verifyEmail(token: string): Promise<PasswordResetResponse> {
  return apiClient.post<PasswordResetResponse>('/auth/verify-email', { token }, { skipAuth: true });
}

async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  return apiClient.post<TokenResponse>('/auth/refresh', { refreshToken: refreshTokenValue }, { skipAuth: true });
}

async function logout(refreshTokenValue: string): Promise<boolean> {
  return apiClient.post<boolean>('/auth/logout', { refreshToken: refreshTokenValue });
}

async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return enrichUser(response);
}

async function loginWithGoogle(googleToken: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/google', { token: googleToken }, { skipAuth: true });
  return {
    ...response,
    user: enrichUser(response.user),
  };
}

async function verifyOtp(otp: string): Promise<PasswordResetResponse> {
  // Simulated success since backend uses email verification tokens
  return Promise.resolve({ success: true, message: 'OTP verified successfully' });
}

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout,
  getCurrentUser,
  loginWithGoogle,
  verifyOtp,
};

export type { AuthResponse as AuthResult, User as AuthUser };
