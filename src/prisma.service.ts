import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcryptjs';
import { DEFAULT_AVATAR } from './constants';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.initializeAdminAccounts();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async initializeAdminAccounts() {
    const adminUsername = 'admin';
    const reviewerUsername = 'reviewer';
    const defaultPassword = process.env.ADMIN_PASSWORD;

    if (!defaultPassword) {
      console.log('请在.env中配置ADMIN_PASSWORD');
      return;
    }

    const adminExists = await this.user.findUnique({
      where: { username: adminUsername },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await this.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          avatarUrl: DEFAULT_AVATAR,
          role: UserRole.ADMIN,
        },
      });
    }

    const reviewerExists = await this.user.findUnique({
      where: { username: reviewerUsername },
    });

    if (!reviewerExists) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await this.user.create({
        data: {
          username: reviewerUsername,
          password: hashedPassword,
          avatarUrl: DEFAULT_AVATAR,
          role: UserRole.REVIEWER,
        },
      });
    }
  }
}
