import { Injectable } from '@nestjs/common';
import { Prisma, TravelNote } from 'generated/prisma';
import { NOTE_STATUS } from 'src/contants';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async getApprovedNotes(page = 1, pageSize = 10, keyword = '') {
    const where = {
      status: NOTE_STATUS.APPROVED,
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { author: { username: { contains: keyword, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, notes] = await this.prisma.$transaction([
      this.prisma.travelNote.count({ where }),
      this.prisma.travelNote.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          media: {
            where: { type: 'IMAGE' },
            take: 1,
            select: { url: true },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      data: notes.map((note) => ({
        id: note.id,
        title: note.title,
        imageUrl: note.media[0]?.url || null,
        author: note.author,
      })),
    };
  }

  async getUserNotes(userId: string, page = 1, pageSize = 10) {
    const where = { authorId: userId };

    const [total, notes] = await this.prisma.$transaction([
      this.prisma.travelNote.count({ where }),
      this.prisma.travelNote.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          rejectReason: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      data: notes,
    };
  }

  async updateNotes(id: string, data: Partial<TravelNote>) {
    return this.prisma.travelNote.update({
      where: { id },
      data,
    });
  }

  async deleteNote(id: string) {
    return this.prisma.travelNote.delete({
      where: { id },
    });
  }

  async createNote(data: Prisma.TravelNoteCreateInput) {
    return this.prisma.travelNote.create({
      data,
    });
  }
}
