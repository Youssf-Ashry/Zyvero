import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';

const publicUser = (user: { id: string; email: string; name: string; createdAt: Date }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, name: dto.name.trim(), passwordHash },
        });
        const slug = `${this.slugify(dto.name)}-${user.id.slice(0, 8)}`;
        const workspace = await tx.workspace.create({
          data: {
            name: `${dto.name.trim()}'s Workspace`,
            slug,
            ownerId: user.id,
            members: { create: { userId: user.id, role: 'OWNER' } },
          },
        });
        return { user, workspace };
      });
      return this.withToken(publicUser(result.user), result.workspace);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An account with that email already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.withToken(publicUser(user));
  }

  async me(authUser: AuthUser) {
    const user = await this.prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return publicUser(user);
  }

  async issueToken(user: AuthUser) {
    return this.withToken(user);
  }

  private withToken(user: object, workspace?: object) {
    const payload = user as AuthUser;
    const token = this.jwt.sign({
      sub: payload.id,
      email: payload.email,
    });
    return { user, token, ...(workspace ? { workspace } : {}) };
  }

  private slugify(value: string) {
    return (
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'workspace'
    );
  }
}
