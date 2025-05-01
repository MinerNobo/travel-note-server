import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

@Module({
  providers: [PrismaService, NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
