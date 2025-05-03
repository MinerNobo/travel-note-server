import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaService } from 'src/prisma.service';
import { NotesModule } from 'src/notes/notes.module';
import { NotesService } from 'src/notes/notes.service';

@Module({
  imports: [NotesModule],
  controllers: [ReviewController],
  providers: [NotesService, ReviewService, PrismaService],
})
export class ReviewModule {}
