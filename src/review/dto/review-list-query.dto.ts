import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { NoteStatus } from 'generated/prisma';

export class ReviewListQueryDto {
  @Matches(/^\d+$/, { message: '页码必须是正整数' })
  @IsString({ message: '页码必须是字符串' })
  @IsOptional()
  page?: string = '1';

  @Matches(/^\d+$/, { message: '每页数量必须是正整数' })
  @IsString({ message: '每页数量必须是字符串' })
  @IsOptional()
  pageSize?: string = '10';

  @MaxLength(50, { message: '关键词长度不能超过50个字符' })
  @IsString({ message: '关键词必须是字符串' })
  @IsOptional()
  keyword?: string = '';

  @IsEnum(NoteStatus, { message: '无效的笔记状态' })
  @IsOptional()
  status?: NoteStatus;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式必须为YYYY-MM-DD' })
  @IsString({ message: '开始日期必须是字符串' })
  @IsOptional()
  from?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式必须为YYYY-MM-DD' })
  @IsString({ message: '结束日期必须是字符串' })
  @IsOptional()
  to?: string;
}
