import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
  getOptionsToken,
  getStorageToken,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(getOptionsToken())
    protected readonly options: ThrottlerModuleOptions,
    @Inject(getStorageToken())
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Request): Promise<string> {
    return (req as any).user?.id || req.ip;
  }

  protected getCustomLimit(user?: any): number {
    if (!user) return 10; // 未登录用户
    switch (user.role) {
      case 'ADMIN':    return 200;
      case 'REVIEWER': return 100;
      case 'USER':     return 80;
      default:         return 20;
    }
  }

  protected getCustomTTL(user?: any): number {
    // 统一使用秒为单位
    if (!user) return 60;
    switch (user.role) {
      case 'ADMIN':    return 30 * 60;
      case 'REVIEWER': return 15 * 60;
      case 'USER':     return 5 * 60;
      default:         return 2 * 60;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    const limit = this.getCustomLimit(user);
    const ttl = this.getCustomTTL(user);
    const tracker = await this.getTracker(request);
    const key = this.generateKey(context, tracker, user?.role || 'anonymous');

    const { totalHits, timeToExpire, isBlocked } = 
      await this.storageService.increment(key, ttl, limit, ttl, user?.role || 'anonymous');

    if (isBlocked || totalHits > limit) {
      throw new ThrottlerException('请求过于频繁，请稍后重试');
    }

    return true;
  }
}