import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(2, { message: '用户名长度不能少于2个字符' })
  @MaxLength(20, { message: '用户名长度不能超过20个字符' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(30, { message: '密码长度不能超过30个字符' })
  password: string;

  @IsString({ message: '用户头像必须是字符串' })
  @IsUrl({}, { message: '请提供有效的头像URL' })
  @MaxLength(300, { message: '头像URL长度不能超过300个字符' })
  @IsOptional()
  avatarUrl?: string;
}
