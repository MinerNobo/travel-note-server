import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR as number;
    let errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '服务器发生未知错误',
      errorDetails: null as any,
    };

    // HTTP异常处理
    if (exception instanceof HttpException) {
      status = exception.getStatus() as number;
      errorResponse.statusCode = status;
      errorResponse.message = exception.message;
    }

    // 文件上传相关错误处理
    if (exception instanceof Error) {
      if (exception.message.includes('文件上传失败')) {
        status = HttpStatus.BAD_REQUEST as number;
        errorResponse.statusCode = status;
        errorResponse.message = exception.message;
        errorResponse.errorDetails = {
          originalError: exception.message,
          stack: exception.stack,
        };
      }

      // 文件系统错误处理
      if (
        exception.message.includes('文件或目录不存在') ||
        exception.message.includes('权限不足') ||
        exception.message.includes('存储空间不足')
      ) {
        status = HttpStatus.INTERNAL_SERVER_ERROR as number;
        errorResponse.statusCode = status;
        errorResponse.message = exception.message;
        errorResponse.errorDetails = {
          originalError: exception.message,
          stack: exception.stack,
        };
      }

      // 视频处理错误处理
      if (exception.message.includes('视频处理失败')) {
        status = HttpStatus.UNPROCESSABLE_ENTITY as number;
        errorResponse.statusCode = status;
        errorResponse.message = exception.message;
        errorResponse.errorDetails = {
          originalError: exception.message,
          stack: exception.stack,
        };
      }
    }

    // 记录详细错误日志（仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      this.logger.error(`
        Error Details:
        - Method: ${request.method}
        - URL: ${request.url}
        - Status: ${status}
        - Exception: ${exception}
        - Stack: ${exception instanceof Error ? exception.stack : 'No stack trace'}
      `);
    }

    // 返回错误响应
    response.status(status).json({
      ...errorResponse,
      ...(process.env.NODE_ENV !== 'production' && {
        originalError:
          exception instanceof Error ? exception.message : String(exception),
      }),
    });
  }
}
