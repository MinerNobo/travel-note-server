import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateAvatarDto {
  @IsNotEmpty({ message: '头像URL不能为空' })
  @IsString({ message: '头像URL必须是字符串' })
  @MaxLength(300, { message: '头像URL长度不能超过300个字符' })
  avatarUrl: string;
}
