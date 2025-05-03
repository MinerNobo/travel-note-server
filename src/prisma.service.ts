import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcryptjs';

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
    const defaultPassword = '123456'; // 默认密码，建议在首次登录后修改

    // 检查管理员账号是否存在
    const adminExists = await this.user.findUnique({
      where: { username: adminUsername },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await this.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });
      console.log('Admin account created successfully');
    }

    // 检查审核员账号是否存在
    const reviewerExists = await this.user.findUnique({
      where: { username: reviewerUsername },
    });

    if (!reviewerExists) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await this.user.create({
        data: {
          username: reviewerUsername,
          password: hashedPassword,
          role: UserRole.REVIEWER,
        },
      });
      console.log('Reviewer account created successfully');
    }
  }
}
