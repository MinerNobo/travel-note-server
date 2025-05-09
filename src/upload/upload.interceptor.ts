import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as path from 'path';

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private readonly FILE_TYPES = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    video: ['.mp4', '.avi', '.mov', '.mkv'],
  };

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();

    this.validateFileType(fileExt, request.url);

    this.validateFileSize(file.size);

    return next.handle();
  }

  private validateFileType(fileExt: string, url: string) {
    let allowedTypes: string[];

    if (url.includes('/upload/image')) {
      allowedTypes = this.FILE_TYPES.image;
    } else if (url.includes('/upload/video')) {
      allowedTypes = this.FILE_TYPES.video;
    } else {
      throw new BadRequestException('未知的上传类型');
    }

    if (!allowedTypes.includes(fileExt)) {
      throw new BadRequestException(
        `不支持的文件类型，仅支持 ${allowedTypes.join(', ')}`,
      );
    }
  }

  private validateFileSize(fileSize: number) {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小不能超过 ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }
}
