import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

interface CreateCheckInDto {
  cityName: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class CheckInService {
  constructor(private prisma: PrismaService) {}

  async getCheckInRecords(userId: string) {
    return await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async createCheckIn(userId: string, createCheckInDto: CreateCheckInDto) {
    return await this.prisma.checkIn.create({
      data: {
        userId,
        cityName: createCheckInDto.cityName,
        latitude: createCheckInDto.latitude,
        longitude: createCheckInDto.longitude,
      },
    });
  }
}
