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
  BadRequestException,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('approved')
  async getApprovedNotes(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('keyword') keyword = '',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.notesService.getApprovedNotes(
      pageNum,
      pageSizeNum,
      keyword,
      fromDate,
      toDate,
    );
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

  @Get(':id')
  async getNoteById(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('游记ID不能为空');
    }
    return this.notesService.getNoteById(id);
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
