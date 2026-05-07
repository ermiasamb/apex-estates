import { graphqlClient } from '@/lib/graphql-client';

// GraphQL mutations and queries
const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        phone
        avatarUrl
        role
        status
        isEmailVerified
        isPhoneVerified
        createdAt
        updatedAt
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        phone
        avatarUrl
        role
        status
        isEmailVerified
        isPhoneVerified
        createdAt
        updatedAt
      }
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      success
      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      success
      message
    }
  }
`;

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      email
      firstName
      lastName
      phone
      avatarUrl
      role
      status
      isEmailVerified
      isPhoneVerified
      createdAt
      updatedAt
    }
  }
`;

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

// Service functions
async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await graphqlClient.request<{ login: AuthResponse }>(
    LOGIN_MUTATION,
    { input: { email, password } },
    { skipAuth: true }
  );
  return data.login;
}

async function register(input: RegisterInput): Promise<AuthResponse> {
  const data = await graphqlClient.request<{ register: AuthResponse }>(
    REGISTER_MUTATION,
    { input },
    { skipAuth: true }
  );
  return data.register;
}

async function forgotPassword(email: string): Promise<PasswordResetResponse> {
  const data = await graphqlClient.request<{ forgotPassword: PasswordResetResponse }>(
    FORGOT_PASSWORD_MUTATION,
    { input: { email } },
    { skipAuth: true }
  );
  return data.forgotPassword;
}

async function resetPassword(newPassword: string, token: string): Promise<PasswordResetResponse> {
  const data = await graphqlClient.request<{ resetPassword: PasswordResetResponse }>(
    RESET_PASSWORD_MUTATION,
    { input: { newPassword, token } },
    { skipAuth: true }
  );
  return data.resetPassword;
}

async function verifyEmail(token: string): Promise<PasswordResetResponse> {
  const data = await graphqlClient.request<{ verifyEmail: PasswordResetResponse }>(
    VERIFY_EMAIL_MUTATION,
    { input: { token } },
    { skipAuth: true }
  );
  return data.verifyEmail;
}

async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const data = await graphqlClient.request<{ refreshToken: TokenResponse }>(
    REFRESH_TOKEN_MUTATION,
    { input: { refreshToken: refreshTokenValue } },
    { skipAuth: true }
  );
  return data.refreshToken;
}

async function logout(refreshTokenValue: string): Promise<boolean> {
  const data = await graphqlClient.request<{ logout: boolean }>(
    LOGOUT_MUTATION,
    { refreshToken: refreshTokenValue },
    { skipAuth: true }
  );
  return data.logout;
}

async function getCurrentUser(): Promise<User> {
  const data = await graphqlClient.request<{ me: User }>(ME_QUERY);
  return data.me;
}

// Social login - Google
// Note: Backend needs to implement Google OAuth endpoint
// For now, this will be handled via popup redirect flow

const GOOGLE_AUTH_MUTATION = `
  mutation GoogleAuth($token: String!) {
    googleAuth(token: $token) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        phone
        avatarUrl
        role
        status
        isEmailVerified
        isPhoneVerified
        createdAt
        updatedAt
      }
    }
  }
`;

async function loginWithGoogle(googleToken: string): Promise<AuthResponse> {
  const data = await graphqlClient.request<{ googleAuth: AuthResponse }>(
    GOOGLE_AUTH_MUTATION,
    { token: googleToken },
    { skipAuth: true }
  );
  return data.googleAuth;
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
};

export type { AuthResponse as AuthResult, User as AuthUser };

