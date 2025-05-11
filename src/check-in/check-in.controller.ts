import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CatchException } from '../common/decorators/catch-exception.decorator';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';

@Controller('checkin')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @CatchException('CheckInController-GetRecords')
  async getCheckInRecords(@Req() req) {
    const userId = req.user.id;
    return this.checkInService.getCheckInRecords(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @CatchException('CheckInController-CreateCheckIn')
  async createCheckIn(@Req() req, @Body() createCheckInDto: CreateCheckInDto) {
    const userId = req.user.id;
    return this.checkInService.createCheckIn(userId, {
      cityName: createCheckInDto.cityName,
      latitude: createCheckInDto.latitude,
      longitude: createCheckInDto.longitude,
    });
  }
}
