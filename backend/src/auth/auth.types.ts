export interface AuthUser {
  id: string;
  email: string;
}

export interface JwtPayload extends AuthUser {
  sub?: string;
  iat?: number;
  exp?: number;
}
