import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

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

  async logout(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds

      await this.prisma.tokenBlacklist.create({
        data: {
          token,
          expiresAt,
        },
      });

      return { message: '登出成功' };
    } catch (error) {
      throw new UnauthorizedException('无效的token');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
