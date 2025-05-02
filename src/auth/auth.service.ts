import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'generated/prisma';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private generateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateUser(username: string, password: string) {
    const user = (await this.userService.findByUsername(
      username,
      true,
    )) as User;
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user,
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = (await this.userService.findById(decoded.sub)) as User;
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('无效的token');
    }
  }

  async logout(token: string) {
    if (!token) {
      throw new UnauthorizedException('未提供token');
    }

    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded || !decoded.exp) {
        throw new UnauthorizedException('无效的token');
      }

      const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds

      const tokenHash = this.generateTokenHash(token);

      const existingToken = await this.prisma.tokenBlacklist.findUnique({
        where: { tokenHash },
      });

      if (existingToken) {
        return { message: 'token已经失效' };
      }

      await this.prisma.tokenBlacklist.create({
        data: {
          tokenHash,
          expiresAt,
        },
      });

      return { message: '登出成功' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('无效的token');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!token) {
      return true;
    }

    try {
      const tokenHash = this.generateTokenHash(token);
      const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
        where: { tokenHash },
      });
      return !!blacklistedToken;
    } catch (error) {
      return true;
    }
  }
}
