import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { Prisma, TravelNote } from 'generated/prisma';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('keyword') keyword = '',
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getApprovedNotes(pageNum, pageSizeNum, keyword);
  }

  @Get('user/:userId')
  async getUserNotes(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getUserNotes(userId, pageNum, pageSizeNum);
  }

  @Patch(':id')
  async updateNote(@Param('id') id: string, @Body() data: Partial<TravelNote>) {
    return this.notesService.updateNotes(id, data);
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }

  @Post()
  async createNote(@Body() data: Prisma.TravelNoteCreateInput) {
    return this.notesService.createNote(data);
  }
}
