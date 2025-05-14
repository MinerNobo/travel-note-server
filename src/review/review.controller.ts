import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
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
      return await this.reviewService.getReviewList(query);
  }

  @Get(':id')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async getNote(@Param('id') id: string) {
    return await this.reviewService.getNoteById(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async approveNote(@Param('id') id: string) {
    return await this.reviewService.approveNote(id);
  }

  @Post(':id/reject')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async rejectNote(@Param('id') id: string, @Body() data: RejectReviewDto) {
    return await this.reviewService.rejectNote(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteNote(@Param('id') id: string) {
    return await this.reviewService.deleteNote(id);
  }
}
