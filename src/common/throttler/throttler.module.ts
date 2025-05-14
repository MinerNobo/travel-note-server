import { Module } from '@nestjs/common';
import { ThrottlerModule} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './custom-throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
        {
          ttl: 60 * 60,
          limit: 100,
        },
      ],
      errorMessage: '请求过于频繁，请稍后重试',
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard, 
    },
  ],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}
