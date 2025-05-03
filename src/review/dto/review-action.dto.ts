import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReviewDto {
  @IsNotEmpty()
  @IsString()
  rejectReason: string;
}
