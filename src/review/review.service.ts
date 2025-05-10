import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { RejectReviewDto } from './dto/review-action.dto';
import { NotesService } from 'src/notes/notes.service';
import { NotificationService } from 'src/notification/notification.service';
import { NoteStatus, NotificationType } from 'generated/prisma';
import { CatchException } from 'src/common/decorators/catch-exception.decorator';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private notesService: NotesService,
    private notificationService: NotificationService,
  ) {}

  @CatchException('ReviewService.getReviewList')
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

  @CatchException('ReviewService.approveNote')
  async approveNote(noteId: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
      include: { author: true },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    if (note.status !== NoteStatus.PENDING) {
      throw new BadRequestException('该游记不在待审核状态');
    }

    const updatedNote = await this.prisma.travelNote.update({
      where: { id: noteId },
      data: { status: NoteStatus.APPROVED },
    });

    await this.notificationService.createNotification(
      note.authorId,
      NotificationType.NOTE_APPROVED,
      `您的游记《${note.title}》已审核通过`,
      noteId,
    );

    return updatedNote;
  }

  @CatchException('ReviewService.rejectNote')
  async rejectNote(noteId: string, data: RejectReviewDto) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
      include: { author: true },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    if (note.status !== NoteStatus.PENDING) {
      throw new BadRequestException('该游记不在待审核状态');
    }

    const updatedNote = await this.prisma.travelNote.update({
      where: { id: noteId },
      data: {
        status: NoteStatus.REJECTED,
        rejectReason: data.rejectReason,
      },
    });

    await this.notificationService.createNotification(
      note.authorId,
      NotificationType.NOTE_REJECTED,
      `您的游记《${note.title}》未通过审核。原因：${data.rejectReason}`,
      noteId,
    );

    return updatedNote;
  }

  @CatchException('ReviewService.deleteNote')
  async deleteNote(noteId: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
      include: { author: true },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    const deletedNote = await this.prisma.travelNote.update({
      where: { id: noteId },
      data: {
        isDeleted: true,
      },
    });

    await this.notificationService.createNotification(
      note.authorId,
      NotificationType.NOTE_DELETED,
      `您的游记《${note.title}》已被管理员删除`,
      noteId,
    );

    return deletedNote;
  }

  @CatchException('ReviewService.getNoteById')
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
