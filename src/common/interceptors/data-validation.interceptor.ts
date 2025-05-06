import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ValidationRule {
  type: 'blacklist' | 'whitelist' | 'regex' | 'size';
  pattern?: RegExp | string[];
  maxSize?: number;
  errorMessage?: string;
}

@Injectable()
export class DataValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DataValidationInterceptor.name);

  private globalRules: Record<string, ValidationRule[]> = {
    '/notes': [
      {
        type: 'size',
        maxSize: 1024 * 1024,
        errorMessage: '笔记内容不能超过1MB',
      },
      {
        type: 'blacklist',
        pattern: ['<script>', 'eval(', 'javascript:'],
        errorMessage: '检测到潜在的恶意内容',
      },
    ],
    '/upload': [
      {
        type: 'whitelist',
        pattern: ['.jpg', '.png', '.gif', '.mp4'],
        errorMessage: '仅允许特定文件类型',
      },
    ],
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 安全地处理请求体
    const body = request.body || {};
    request.body = body;

    this.validateRequestData(request);

    return next.handle().pipe(
      map((data) => {
        return this.validateResponseData(request.url, data);
      }),
    );
  }

  private validateRequestData(request: any) {
    const url = request.url;
    const body = request.body;
    const rules = this.getRulesForPath(url);

    if (body && Object.keys(body).length > 0) {
      rules.forEach((rule) => {
        switch (rule.type) {
          case 'blacklist':
            this.checkBlacklist(body, rule);
            break;
          case 'whitelist':
            this.checkWhitelist(body, rule);
            break;
          case 'regex':
            this.checkRegexPattern(body, rule);
            break;
          case 'size':
            this.checkDataSize(body, rule);
            break;
        }
      });
    }
  }

  private validateResponseData(url: string, data: any) {
    if (Array.isArray(data)) {
      const limitedData = data.slice(0, 1000);

      return limitedData.map((item) => this.desensitizeData(item));
    }
    return this.desensitizeData(data);
  }

  private desensitizeData(data: any) {
    if (typeof data === 'object' && data !== null) {
      const sensitiveFields = ['password', 'token'];

      sensitiveFields.forEach((field) => {
        if (data[field]) {
          data[field] = this.maskSensitiveInfo(data[field]);
        }
      });
    }
    return data;
  }

  private maskSensitiveInfo(value: string): string {
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '****' + value.slice(-2);
  }

  private getRulesForPath(url: string): ValidationRule[] {
    const specialRules: ValidationRule[] = [
      {
        type: 'size',
        maxSize: 10 * 1024 * 1024,
        errorMessage: '查询数据量过大',
      },
    ];

    if (url.includes('/notes/approved')) {
      return specialRules;
    }

    const matchedRules = Object.entries(this.globalRules)
      .filter(([path]) => url.includes(path))
      .map(([, rules]) => rules);

    return matchedRules.length > 0 ? matchedRules[0] : [];
  }

  private checkBlacklist(data: any, rule: ValidationRule) {
    const blacklist = rule.pattern as string[];
    const dataStr = JSON.stringify(data).toLowerCase();

    const match = blacklist.find((item) =>
      dataStr.includes(item.toLowerCase()),
    );

    if (match) {
      this.logger.warn(`检测到黑名单内容: ${match}`);
      throw new BadRequestException(rule.errorMessage || '检测到非法内容');
    }
  }

  private checkWhitelist(data: any, rule: ValidationRule) {
    const whitelist = rule.pattern as string[];
    const dataStr = JSON.stringify(data);

    const isValid = whitelist.some((item) => dataStr.includes(item));

    if (!isValid) {
      this.logger.warn(`不符合白名单要求`);
      throw new BadRequestException(rule.errorMessage || '文件类型不被允许');
    }
  }

  private checkRegexPattern(data: any, rule: ValidationRule) {
    const regex = rule.pattern as RegExp;
    const dataStr = JSON.stringify(data);

    if (regex.test(dataStr)) {
      this.logger.warn(`检测到非法正则模式`);
      throw new BadRequestException(rule.errorMessage || '数据格式不合法');
    }
  }

  private checkDataSize(data: any, rule: ValidationRule) {
    try {
      if (data === undefined || data === null) {
        return;
      }

      const dataStr =
        typeof data === 'string' ? data : JSON.stringify(data || {});

      const dataSize = Buffer.byteLength(dataStr);

      if (dataSize > (rule.maxSize || 1024 * 1024)) {
        this.logger.warn(`数据超过最大限制`);
        throw new BadRequestException(rule.errorMessage || '数据大小超过限制');
      }
    } catch (error) {
      this.logger.error('数据大小检查出错', error);
    }
  }
}
