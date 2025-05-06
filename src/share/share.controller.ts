import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareMetadataDto } from './dto/share-metadata.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('wechat/signature')
  @UseGuards(JwtAuthGuard)
  async getWechatSignature(@Query('url') url: string) {
    return this.shareService.getWechatJSSDKSignature(url);
  }

  @Get('travel-note/:id')
  @UseGuards(JwtAuthGuard)
  async getTravelNoteShareMetadata(
    @Param('id') travelNoteId: string,
  ): Promise<ShareMetadataDto> {
    return this.shareService.generateShareMetadata(travelNoteId);
  }
}
