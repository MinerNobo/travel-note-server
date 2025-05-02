import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteStatus, Prisma, TravelNote } from 'generated/prisma';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('keyword') keyword = '',
    @Query('status') status?: NoteStatus,
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getAllNotes(pageNum, pageSizeNum, keyword, status);
  }

  @Get('approved')
  async getApprovedNotes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('keyword') keyword = '',
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getApprovedNotes(pageNum, pageSizeNum, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyNotes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Request() req,
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getUserNotes(req.user.id, pageNum, pageSizeNum);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateNote(
    @Param('id') id: string,
    @Body() data: Partial<CreateNoteDto>,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.notesService.updateNote(id, userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteNote(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.notesService.deleteNote(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNote(@Body() data: CreateNoteDto, @Request() req) {
    const userId = req.user.id;
    return this.notesService.createNote(userId, data);
  }
}
