import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { UploadInterceptor } from './upload.interceptor';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(UploadInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      url: await this.uploadService.uploadImage(file),
    };
  }

  @Post('video')
  @UseInterceptors(UploadInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60 * 1000 } })
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return {
      url: await this.uploadService.uploadVideo(file),
    };
  }
}
