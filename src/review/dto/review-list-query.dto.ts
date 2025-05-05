import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NoteStatus } from 'generated/prisma';

export class ReviewListQueryDto {
  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  pageSize?: string = '10';

  @IsOptional()
  @IsString()
  keyword?: string = '';

  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
