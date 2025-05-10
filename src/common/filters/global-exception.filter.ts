import { Logger } from '@nestjs/common';

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
