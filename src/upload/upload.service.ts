import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

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

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads${fileName}`;
  }

  async uploadAvatar(file: Express.Multer.File) {
    const compressedBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, compressedBuffer);

    return `/uploads/${fileName}`;
  }
}
