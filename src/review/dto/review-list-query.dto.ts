import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { NoteStatus } from 'generated/prisma';

export class ReviewListQueryDto {
  @IsOptional()
  @IsString({ message: '页码必须是字符串' })
  @Matches(/^\d+$/, { message: '页码必须是正整数' })
  page?: string = '1';

  @IsOptional()
  @IsString({ message: '每页数量必须是字符串' })
  @Matches(/^\d+$/, { message: '每页数量必须是正整数' })
  pageSize?: string = '10';

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  @MaxLength(50, { message: '关键词长度不能超过50个字符' })
  keyword?: string = '';

  @IsOptional()
  @IsEnum(NoteStatus, { message: '无效的笔记状态' })
  status?: NoteStatus;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式必须为YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式必须为YYYY-MM-DD' })
  to?: string;
}
