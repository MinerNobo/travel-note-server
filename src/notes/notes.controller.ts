import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { Prisma, TravelNote } from 'generated/prisma';
import { CreateNoteDto } from './dto/create-note.dto';

const CURRENT_USER_ID = 'cfaef6a7-2692-11f0-85ec-fa163eb50d7b';

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
  async updateNote(
    @Param('id') id: string,
    @Body() data: Partial<CreateNoteDto>,
  ) {
    // TODO: Get userId from authentication
    const userId = CURRENT_USER_ID;
    return this.notesService.updateNote(id, userId, data);
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    // TODO: Get userId from authentication
    const userId = CURRENT_USER_ID;
    return this.notesService.deleteNote(id, userId);
  }

  @Post()
  async createNote(@Body() data: CreateNoteDto) {
    // TODO: Get userId from authentication
    const userId = CURRENT_USER_ID;
    return this.notesService.createNote(userId, data);
  }
}
