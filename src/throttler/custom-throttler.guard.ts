import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    const limit = this.getCustomLimit(user);
    const ttl = this.getCustomTTL(user);

    const tracker = await this.getTracker(request);

    try {
      const key = this.generateKey(context, tracker, 'default');
      const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
        await this.storageService.increment(key, ttl, limit, 0, 'default');

      if (isBlocked) {
        await this.throwThrottlingException(context, {
          limit,
          ttl,
          key,
          tracker,
          totalHits,
          timeToExpire,
          isBlocked,
          timeToBlockExpire,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        return false;
      }
      throw error;
    }
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    limitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();

    console.warn(`限流请求: 
      IP: ${request.ip}
      路径: ${request.path}
      方法: ${request.method}
      时间: ${new Date().toISOString()}
      限流详情: ${JSON.stringify(limitDetail)}
    `);

    throw new ThrottlerException('请求过于频繁，请稍后重试');
  }

  private getCustomLimit(user?: any): number {
    if (!user) return 10; // 未登录用户
    switch (user.role) {
      case 'ADMIN':
        return 1000;
      case 'REVIEWER':
        return 500;
      case 'USER':
        return 100;
      default:
        return 50;
    }
  }

  private getCustomTTL(user?: any): number {
    if (!user) return 60 * 1000;
    switch (user.role) {
      case 'ADMIN':
        return 60 * 60 * 1000;
      case 'REVIEWER':
        return 30 * 60 * 1000;
      case 'USER':
        return 10 * 60 * 1000;
      default:
        return 5 * 60 * 1000;
    }
  }

  protected async getTracker(req: Request): Promise<string> {
    return (req as any).user?.id || req.ip;
  }

  protected async getErrorMessage(
    context: ExecutionContext,
    limitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();
    return `请求过于频繁：${request.path}，限流：${limitDetail.limit}/每${limitDetail.ttl}ms`;
  }
}
