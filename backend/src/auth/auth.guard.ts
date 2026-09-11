import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser, JwtPayload } from './auth.types.js';

function tokenFromRequest(request: Request): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7).trim() || undefined;
  }
  const cookies = request.headers.cookie?.split(';').map((part) => part.trim());
  return cookies
    ?.find((cookie) => cookie.startsWith('access_token='))
    ?.slice('access_token='.length);
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthUser }
    >();
    const token = tokenFromRequest(request);
    if (!token) throw new UnauthorizedException('Authentication required');

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      if (!payload.sub && !payload.id) throw new UnauthorizedException();
      request.user = { id: payload.sub ?? payload.id, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
