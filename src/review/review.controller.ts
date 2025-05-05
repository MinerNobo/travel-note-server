import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { RejectReviewDto } from './dto/review-action.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'generated/prisma';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('review')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async getReviewList(@Query() query: ReviewListQueryDto) {
    try {
      return await this.reviewService.getReviewList(query);
    } catch (error) {
      throw new HttpException(
        '获取审核列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async getNote(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('游记ID不能为空');
      }
      return await this.reviewService.getNoteById(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        '获取游记详情失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/approve')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async approveNote(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('游记ID不能为空');
      }
      return await this.reviewService.approveNote(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        '审核通过操作失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reject')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async rejectNote(@Param('id') id: string, @Body() data: RejectReviewDto) {
    try {
      if (!id) {
        throw new BadRequestException('游记ID不能为空');
      }
      return await this.reviewService.rejectNote(id, data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        '拒绝审核操作失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteNote(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('游记ID不能为空');
      }
      return await this.reviewService.deleteNote(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        '删除游记操作失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
