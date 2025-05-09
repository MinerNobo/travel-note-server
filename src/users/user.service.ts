import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from 'generated/prisma';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        avatarUrl:
          createUserDto.avatarUrl || '/uploads/images/default-avatar.jpg',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findByUsername(
    username: string,
    includePassword = false,
  ): Promise<User | UserWithoutPassword> {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!includePassword) {
      const { password, ...result } = user;
      return result;
    }

    return user;
  }

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const { password, ...result } = user;
    return result;
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    const { password, ...result } = user;
    return result;
  }
}
