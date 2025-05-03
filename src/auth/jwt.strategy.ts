import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    try {
      const token = request.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('未提供token');
      }

      const isBlacklisted = await this.authService.isTokenBlacklisted(token);

      if (isBlacklisted) {
        throw new UnauthorizedException('token已失效');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('无效的token');
    }
  }
}
