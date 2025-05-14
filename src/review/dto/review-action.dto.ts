import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { NoteStatus } from 'generated/prisma';

export class RejectReviewDto {
  @MaxLength(200, { message: '拒绝原因长度不能超过200个字符' })
  @IsString({ message: '拒绝原因必须是字符串' })
  @IsNotEmpty({ message: '拒绝理由不能为空' })
  @IsOptional()
  rejectReason: string;

  @IsEnum(NoteStatus, { message: '无效的笔记状态' })
  status: NoteStatus;
}
