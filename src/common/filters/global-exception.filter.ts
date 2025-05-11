import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
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

    if (exception instanceof HttpException) {
      status = exception.getStatus() as number;
      errorResponse.statusCode = status;
      errorResponse.message = exception.message;
    }

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

      if (exception.message.includes('视频处理失败')) {
        status = HttpStatus.UNPROCESSABLE_ENTITY as number;
        errorResponse.statusCode = status;
        errorResponse.message = exception.message;
        errorResponse.errorDetails = {
          originalError: exception.message,
          stack: exception.stack,
        };
      }

      if (exception.message.includes('Prisma')) {
        status = HttpStatus.BAD_REQUEST as number;
        errorResponse.statusCode = status;
        errorResponse.message = '数据库操作失败';
        errorResponse.errorDetails = {
          originalError: exception.message,
          stack: exception.stack,
        };
      }
    }

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

    response.status(status).json({
      ...errorResponse,
      ...(process.env.NODE_ENV !== 'production' && {
        originalError:
          exception instanceof Error ? exception.message : String(exception),
      }),
    });
  }
}

export function CatchException(loggerContext?: string): MethodDecorator {
  const logger = new Logger(loggerContext || 'GlobalMethodHandler');

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.error(`Error in ${propertyKey}`, error.stack);

        const enhancedError = new Error(error.message);
        enhancedError.name = error.name;
        enhancedError.stack = error.stack;

        if (error instanceof Error) {
          if (propertyKey === 'uploadImage' || propertyKey === 'uploadVideo') {
            enhancedError.message = `文件上传失败：${error.message}`;
          }
        }

        if (error.code) {
          switch (error.code) {
            case 'ENOENT':
              enhancedError.message = `文件或目录不存在：${error.path}`;
              break;
            case 'EACCES':
              enhancedError.message = `权限不足：无法访问 ${error.path}`;
              break;
            case 'ENOSPC':
              enhancedError.message = '存储空间不足，无法写入文件';
              break;
          }
        }

        // FFmpeg
        if (propertyKey === 'uploadVideo' && error.message.includes('ffmpeg')) {
          enhancedError.message = `视频处理失败：${error.message}`;
        }

        throw enhancedError;
      }
    };

    return descriptor;
  };
}
