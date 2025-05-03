import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NoteStatus, Prisma, UserRole } from 'generated/prisma';
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
    return this.notesService.getAllNotes(
      parseInt(query.page || '1'),
      parseInt(query.pageSize || '10'),
      query.keyword || '',
      query.status,
    );
  }

  async approveNote(noteId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== UserRole.REVIEWER && user.role !== UserRole.ADMIN)
    ) {
      throw new ForbiddenException('没有审核权限');
    }

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

  async rejectNote(noteId: string, userId: string, data: RejectReviewDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== UserRole.REVIEWER && user.role !== UserRole.ADMIN)
    ) {
      throw new ForbiddenException('没有审核权限');
    }

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

  async deleteNote(noteId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('没有删除权限');
    }

    const note = await this.prisma.travelNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new BadRequestException('游记不存在');
    }

    // 逻辑删除：更新 isDeleted 字段
    return this.prisma.travelNote.update({
      where: { id: noteId },
      data: {
        isDeleted: true,
      },
    });
  }
}
