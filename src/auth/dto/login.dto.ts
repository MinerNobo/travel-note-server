import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
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
}
