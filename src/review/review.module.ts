import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaService } from 'src/prisma.service';
import { NotesModule } from 'src/notes/notes.module';
import { NotesService } from 'src/notes/notes.service';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule, NotesModule, NotificationModule],
  controllers: [ReviewController],
  providers: [NotesService, ReviewService, PrismaService],
})
export class ReviewModule {}
