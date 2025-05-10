import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateNoteDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(50, { message: '标题长度不能超过50个字符' })
  @Transform(({ value }) => value.trim())
  title: string;

  @IsNotEmpty({ message: '内容不能为空' })
  @IsString({ message: '内容必须是字符串' })
  @MaxLength(2000, { message: '内容长度不能超过2000个字符' })
  @Transform(({ value }) => value.trim())
  content: string;

  @IsArray()
  @IsNotEmpty({ message: '至少需要上传一张图片' })
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media: MediaDto[];
}
export class MediaDto {
  @IsEnum(['IMAGE', 'VIDEO'], { message: '媒体类型必须是IMAGE或VIDEO' })
  type: 'IMAGE' | 'VIDEO';

  @IsNotEmpty({ message: '媒体URL不能为空' })
  @IsString({ message: '媒体URL必须是字符串' })
  @MaxLength(300, { message: '媒体URL长度不能超过300个字符' })
  url: string;

  @IsString()
  @IsOptional()
  @IsString({ message: '缩略图URL必须是字符串' })
  @MaxLength(300, { message: '缩略图URL长度不能超过300个字符' })
  thumbnailUrl?: string;
}
