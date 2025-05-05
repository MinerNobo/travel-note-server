import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectReviewDto {
  @IsNotEmpty({ message: '拒绝理由不能为空' })
  @IsString({ message: '拒绝理由必须是字符串' })
  @MaxLength(500, { message: '拒绝理由不能超过500个字符' })
  rejectReason: string;
}
