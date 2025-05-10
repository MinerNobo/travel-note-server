import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Prisma, NoteStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { CatchException } from 'src/common/decorators/catch-exception.decorator';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private prisma: PrismaService) {}

  @CatchException('NotesService.getAllNotes')
  async getAllNotes(
    page = 1,
    pageSize = 10,
    keyword = '',
    status?: NoteStatus,
    from?: Date,
    to?: Date,
  ) {
    const where: Prisma.TravelNoteWhereInput = {
      isDeleted: false,
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { author: { username: { contains: keyword } } },
        ],
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: to,
          },
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
          content: true,
          status: true,
          rejectReason: true,
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              thumbnailUrl: true,
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
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

  @CatchException('NotesService.getApprovedNotes')
  async getApprovedNotes(
    page = 1,
    pageSize = 10,
    keyword = '',
    from?: Date,
    to?: Date,
  ) {
    const where: Prisma.TravelNoteWhereInput = {
      status: NoteStatus.APPROVED,
      ...(keyword && {
        OR: [
          {
            title: {
              contains: keyword,
            },
          },
          {
            author: {
              username: {
                contains: keyword,
              },
            },
          },
        ],
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: to,
          },
        }),
    };

    const [total, notes] = await Promise.all([
      this.prisma.travelNote.count({ where }),
      this.prisma.travelNote.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
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
        content: note.content,
        imageUrl: note.media[0]?.url || null,
        author: note.author,
      })),
    };
  }

  @CatchException('NotesService.getUserNotes')
  async getUserNotes(userId: string, page = 1, pageSize = 10) {
    const where = {
      authorId: userId,
      isDeleted: false,
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
          content: true,
          status: true,
          rejectReason: true,
          media: {
            select: {
              id: true,
              type: true,
              url: true,
              thumbnailUrl: true,
            },
          },
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

  @CatchException('NotesService.createNote')
  async createNote(userId: string, data: CreateNoteDto) {
    const videoCount = data.media.filter((m) => m.type === 'VIDEO').length;
    const imageCount = data.media.filter((m) => m.type === 'IMAGE').length;

    if (videoCount > 1) {
      throw new BadRequestException('只能上传一个视频');
    }

    if (imageCount === 0) {
      throw new BadRequestException('至少需要上传一张图片');
    }

    return this.prisma.travelNote.create({
      data: {
        title: data.title,
        content: data.content,
        status: NoteStatus.PENDING,
        author: {
          connect: { id: userId },
        },
        media: {
          create: data.media.map((media) => ({
            type: media.type,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
          })),
        },
      },
      include: {
        media: true,
      },
    });
  }

  @CatchException('NotesService.updateNote')
  async updateNote(id: string, userId: string, data: Partial<CreateNoteDto>) {
    const note = await this.prisma.travelNote.findFirst({
      where: { id, authorId: userId, isDeleted: false },
    });

    if (!note) {
      throw new BadRequestException('游记不存在或无权限修改');
    }

    if (note.status !== NoteStatus.PENDING) {
      throw new BadRequestException('当前状态不允许修改');
    }

    if (data.media) {
      const videoCount = data.media.filter((m) => m.type === 'VIDEO').length;
      if (videoCount > 1) {
        throw new BadRequestException('只能上传一个视频');
      }

      const imageCount = data.media.filter((m) => m.type === 'IMAGE').length;
      if (imageCount === 0) {
        throw new BadRequestException('至少需要上传一张图片');
      }
    }

    const updateData: Prisma.TravelNoteUpdateInput = {
      status: NoteStatus.PENDING,
    };

    if (data.title) {
      updateData.title = data.title;
    }

    if (data.content) {
      updateData.content = data.content;
    }

    if (data.media) {
      await this.prisma.media.deleteMany({
        where: { travelNoteId: id },
      });

      updateData.media = {
        create: data.media.map((media) => ({
          type: media.type,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
        })),
      };
    }

    return this.prisma.travelNote.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
      },
    });
  }

  @CatchException('NotesService.deleteNote')
  async deleteNote(id: string, userId: string) {
    const note = await this.prisma.travelNote.findFirst({
      where: { id, authorId: userId },
    });

    if (!note) {
      throw new BadRequestException('游记不存在或无权限删除');
    }

    return this.prisma.travelNote.delete({
      where: { id },
    });
  }

  @CatchException('NotesService.getNoteById')
  async getNoteById(id: string) {
    const note = await this.prisma.travelNote.findUnique({
      where: { id, isDeleted: false },
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
