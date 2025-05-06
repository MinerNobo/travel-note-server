import { IsString, IsOptional, IsUrl } from 'class-validator';

export class ShareMetadataDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}
