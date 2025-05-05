import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NoteStatus, Prisma } from 'generated/prisma';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { RejectReviewDto } from './dto/review-action.dto';
import { NotesService } from 'src/notes/notes.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private notesService: NotesService,
  ) {}

  async getReviewList(query: ReviewListQueryDto) {
    const fromDate = query.from ? new Date(query.from) : undefined;
    const toDate = query.to ? new Date(query.to) : undefined;

    return this.notesService.getAllNotes(
      parseInt(query.page || '1'),
      parseInt(query.pageSize || '10'),
      query.keyword || '',
      query.status,
      fromDate,
      toDate,
    );
  }

  async approveNote(noteId: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    if (note.status !== NoteStatus.PENDING) {
      throw new BadRequestException('该游记不在待审核状态');
    }

    return this.prisma.travelNote.update({
      where: { id: noteId },
      data: { status: NoteStatus.APPROVED },
    });
  }

  async rejectNote(noteId: string, data: RejectReviewDto) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    if (note.status !== NoteStatus.PENDING) {
      throw new BadRequestException('该游记不在待审核状态');
    }

    return this.prisma.travelNote.update({
      where: { id: noteId },
      data: {
        status: NoteStatus.REJECTED,
        rejectReason: data.rejectReason,
      },
    });
  }

  async deleteNote(noteId: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    return this.prisma.travelNote.update({
      where: { id: noteId },
      data: {
        isDeleted: true,
      },
    });
  }

  async getNoteById(noteId: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        media: {
          select: {
            id: true,
            type: true,
            url: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    return note;
  }
}
