import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @IsArray()
  @IsNotEmpty({ message: '至少需要上传一张图片' })
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media: MediaDto[];
}

export class MediaDto {
  @IsString()
  @IsNotEmpty()
  type: 'IMAGE' | 'VIDEO';

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
