import { Module } from '@nestjs/common';
import { CustomThrottlerModule } from 'src/throttler/throttler.module';

@Module({
  imports: [CustomThrottlerModule],
})
export class AppModule {}
