import { IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: '用户名至少需要3个字符' })
  username: string;

  @IsString()
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string = '/uploads/images/default-avatar.jpg';
}
