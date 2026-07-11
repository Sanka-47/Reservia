import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse() as any;
      message = resContent.message || exception.message;
    } else if (exception instanceof QueryFailedError) {
      const err = exception as any;
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = 'Conflict: A record with these details already exists.';
      } else if (err.code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Bad Request: Referenced service or entity does not exist.';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database query error';
      }
      this.logger.error(
        `Database error (${err.code}): ${err.message}`,
        err.stack,
      );
    } else {
      this.logger.error(
        `Unhandled Exception: ${exception.message || exception}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
    });
  }
}
