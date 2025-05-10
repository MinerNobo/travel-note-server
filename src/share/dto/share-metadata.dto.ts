import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class ShareMetadataDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(100, { message: '标题长度不能超过100个字符' })
  title: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述长度不能超过200个字符' })
  description?: string;

  @IsUrl({}, { message: '请提供有效链接RUL' })
  @IsOptional()
  @MaxLength(300, { message: '链接URL长度不能超过300个字符' })
  link?: string;

  @IsOptional()
  @IsUrl({}, { message: '请提供有效的图片URL' })
  @MaxLength(300, { message: '图片URL长度不能超过300个字符' })
  coverImageUrl?: string;
}
