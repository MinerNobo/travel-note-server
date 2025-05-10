import { Logger } from '@nestjs/common';

export function CatchException(loggerContext?: string): MethodDecorator {
  const logger = new Logger(loggerContext || 'GlobalMethodHandler');

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // 详细日志记录
        logger.error(`Error in ${propertyKey}`, error.stack);

        // 保留原始错误信息和堆栈跟踪
        const enhancedError = new Error(error.message);
        enhancedError.name = error.name;
        enhancedError.stack = error.stack;

        // 如果是文件上传相关的错误，添加额外的上下文信息
        if (error instanceof Error) {
          if (propertyKey === 'uploadImage' || propertyKey === 'uploadVideo') {
            enhancedError.message = `文件上传失败：${error.message}`;
          }
        }

        // 对于文件系统相关错误，提供更具体的错误信息
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

        // 对于 FFmpeg 相关错误，提供更详细的错误描述
        if (propertyKey === 'uploadVideo' && error.message.includes('ffmpeg')) {
          enhancedError.message = `视频处理失败：${error.message}`;
        }

        // 抛出增强的错误
        throw enhancedError;
      }
    };

    return descriptor;
  };
}
