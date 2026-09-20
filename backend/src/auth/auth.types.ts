export interface AuthUser {
  id: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}

export interface JwtPayload extends AuthUser {
  sub?: string;
  iat?: number;
  exp?: number;
}
