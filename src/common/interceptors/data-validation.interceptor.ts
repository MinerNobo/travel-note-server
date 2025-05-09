import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DataValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DataValidationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const body = request.body || {};
    request.body = body;

    return next.handle().pipe(
      map((data) => {
        return this.desensitizeData(data);
      }),
    );
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
}
