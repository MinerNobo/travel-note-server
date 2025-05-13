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
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesService } from './notes.service';

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

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getUserFavorites(
    @Request() req,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notesService.getUserFavorites(
      req.user.id,
      pageNum,
      pageSizeNum,
    );
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string, @Request() req) {
    const note = await this.notesService.getNoteById(id);

    if (req.user) {
      const interactionStatus =
        await this.notesService.getNoteInteractionStatus(req.user.id, id);

      return {
        ...note,
        interactionStatus,
      };
    }

    return note;
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
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
  @Throttle({ default: { limit: 3, ttl: 60 * 1000 } })
  @Delete(':id')
  async deleteNote(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.notesService.deleteNote(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  @Post()
  async createNote(@Body() data: CreateNoteDto, @Request() req) {
    const userId = req.user.id;
    return this.notesService.createNote(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  async viewNote(@Param('id') id: string) {
    return this.notesService.viewNote(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id') travelNoteId: string, @Request() req) {
    return this.notesService.toggleLike(req.user.id, travelNoteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async toggleFavorite(@Param('id') travelNoteId: string, @Request() req) {
    return this.notesService.toggleFavorite(req.user.id, travelNoteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/interaction-status')
  async getNoteInteractionStatus(
    @Param('id') travelNoteId: string,
    @Request() req,
  ) {
    return this.notesService.getNoteInteractionStatus(
      req.user.id,
      travelNoteId,
    );
  }
}
