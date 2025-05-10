import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { ShareMetadataDto } from './dto/share-metadata.dto';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CatchException } from 'src/common/decorators/catch-exception.decorator';

@Injectable()
export class ShareService {
  private readonly wxAppId: string;
  private readonly wxAppSecret: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.wxAppId = this.configService.get('WECHAT_APP_ID') || '';
    this.wxAppSecret = this.configService.get('WECHAT_APP_SECRET') || '';

    if (!this.wxAppId || !this.wxAppSecret) {
      throw new Error(
        '微信配置缺失：请检查 WECHAT_APP_ID 和 WECHAT_APP_SECRET',
      );
    }
  }

  @CatchException('ShareService.getWechatAccessToken')
  private async getWechatAccessToken(): Promise<string> {
    const response = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        params: {
          grant_type: 'client_credential',
          appid: this.wxAppId,
          secret: this.wxAppSecret,
        },
      },
    );

    if (!response.data.access_token) {
      throw new BadRequestException('获取微信 access_token 失败');
    }

    return response.data.access_token;
  }

  @CatchException('ShareService.getWechatJSSDKSignature')
  async getWechatJSSDKSignature(url: string): Promise<{
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
  }> {
    const accessToken = await this.getWechatAccessToken();

    const ticketResponse = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      {
        params: {
          access_token: accessToken,
          type: 'jsapi',
        },
      },
    );

    const jsApiTicket = ticketResponse.data.ticket;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = crypto.randomBytes(16).toString('hex');

    const signatureString = [
      `jsapi_ticket=${jsApiTicket}`,
      `noncestr=${nonceStr}`,
      `timestamp=${timestamp}`,
      `url=${url}`,
    ]
      .sort()
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    return {
      appId: this.wxAppId,
      timestamp,
      nonceStr,
      signature,
    };
  }

  @CatchException('ShareService.generateShareMetadata')
  async generateShareMetadata(travelNoteId: string): Promise<ShareMetadataDto> {
    const travelNote = await this.prismaService.travelNote.findUnique({
      where: { id: travelNoteId },
      include: {
        author: true,
        media: {
          take: 1,
          where: { type: 'IMAGE' },
        },
      },
    });

    if (!travelNote) {
      throw new BadRequestException(`未找到ID为 ${travelNoteId} 的游记`);
    }

    return {
      title: `${travelNote.author.username}的旅行游记 - ${travelNote.title}`,
      description: travelNote.content.slice(0, 100) + '...',
      link: `https://yourdomain.com/travel-notes/${travelNoteId}`,
      coverImageUrl:
        travelNote.media.length > 0 ? travelNote.media[0].url : undefined,
    };
  }
}
