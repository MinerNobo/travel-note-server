import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notifications/notification.module';
import { CustomThrottlerModule } from './common/throttler/throttler.module';
import { CheckInModule } from './check-in/check-in.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomThrottlerModule,
    CheckInModule,
    PrismaModule,
    NotesModule,
    UploadModule,
    AuthModule,
    ReviewModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
