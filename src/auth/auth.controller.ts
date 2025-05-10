import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
  UnauthorizedException,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.authService.login(
      createUserDto.username,
      createUserDto.password,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('未提供token');
    }
    return this.authService.validateToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('未提供token');
    }

    try {
      const result = await this.authService.logout(token);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  async updateAvatar(
    @Headers('authorization') auth: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    // 基本的URL验证
    if (!updateAvatarDto.avatarUrl || updateAvatarDto.avatarUrl.trim() === '') {
      throw new BadRequestException('头像URL不能为空');
    }

    // 验证路径是否以 /uploads/ 开头或是有效的外部URL
    const isValidLocalPath = updateAvatarDto.avatarUrl.startsWith('/uploads/');
    const isValidExternalUrl = /^https?:\/\//i.test(updateAvatarDto.avatarUrl);

    if (!isValidLocalPath && !isValidExternalUrl) {
      throw new BadRequestException('无效的头像URL');
    }

    const token = auth?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('未提供token');
    }

    const user = await this.authService.validateToken(token);
    return this.userService.updateAvatar(user.id, updateAvatarDto.avatarUrl);
  }
}
