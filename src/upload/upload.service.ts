import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as util from 'util';

const ffmpegAsync = {
  thumbnail: util.promisify((inputPath, outputPath, callback) => {
    ffmpeg(inputPath)
      .thumbnail({
        count: 1,
        timemarks: ['1'],
        size: '320x240',
        filename: path.basename(outputPath),
      })
      .on('end', () => callback(null))
      .on('error', (err) => callback(err))
      .output(path.dirname(outputPath));
  }),
};

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File) {
    const compressedBuffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `images/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, compressedBuffer);

    return `/uploads/${fileName}`;
  }

  async uploadVideo(file: Express.Multer.File) {
    const fileName = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);

    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const thumbnailFileName = `thumbnails/${path.basename(safeFileName, path.extname(safeFileName))}.jpg`;
    const thumbnailPath = path.join(this.uploadDir, thumbnailFileName);

    const dir = path.dirname(filePath);
    const thumbnailDir = path.dirname(thumbnailPath);

    if (!fs.existsSync(dir)) {
      console.log('创建视频目录:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailDir)) {
      console.log('创建缩略图目录:', thumbnailDir);
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    try {
      fs.accessSync(thumbnailDir, fs.constants.W_OK);
      console.log('缩略图目录可写');
    } catch (err) {
      console.error('缩略图目录不可写:', err);
    }

    await fs.promises.writeFile(filePath, file.buffer);

    try {
      const tempVideoPath = path.join(
        this.uploadDir,
        `temp-${Date.now()}${path.extname(file.originalname)}`,
      );
      await fs.promises.writeFile(tempVideoPath, file.buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .on('start', (commandLine) => {
            console.log('ffmpeg命令: ' + commandLine);
          })
          .on('error', (err) => {
            console.error('FFmpeg错误:', err);
            reject(err);
          })
          .on('end', () => {
            console.log('缩略图生成完成');
            resolve(true);
          })
          .screenshots({
            count: 1,
            timemarks: ['1'],
            size: '320x240',
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
          });
      });

      await fs.promises.unlink(tempVideoPath);

      if (fs.existsSync(thumbnailPath)) {
        console.log('缩略图生成成功:', thumbnailPath);
      } else {
        console.warn('缩略图文件不存在:', thumbnailPath);
      }

      return {
        videoUrl: `/uploads/${fileName}`,
        thumbnailUrl: `/uploads/${thumbnailFileName}`,
      };
    } catch (error) {
      console.error('缩略图生成错误:', error);

      try {
        const defaultThumbnail =
          await this.generateDefaultVideoThumbnail(thumbnailPath);
        return {
          videoUrl: `/uploads/${fileName}`,
          thumbnailUrl: defaultThumbnail
            ? `/uploads/${thumbnailFileName}`
            : null,
        };
      } catch (defaultError) {
        console.error('默认缩略图生成错误:', defaultError);
        return {
          videoUrl: `/uploads/${fileName}`,
          thumbnailUrl: null,
        };
      }
    }
  }

  private async generateDefaultVideoThumbnail(
    thumbnailPath: string,
  ): Promise<boolean> {
    try {
      const defaultImage = await sharp({
        create: {
          width: 320,
          height: 240,
          channels: 4,
          background: { r: 200, g: 200, b: 200, alpha: 0.5 },
        },
      })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailDir = path.dirname(thumbnailPath);
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      await fs.promises.writeFile(thumbnailPath, defaultImage);
      return true;
    } catch (error) {
      console.error('默认缩略图生成错误:', error);
      return false;
    }
  }
}
