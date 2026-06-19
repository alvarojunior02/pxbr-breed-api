import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;

        const statusCode = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = isHttpException ? exception.getResponse() : null;

        const message =
            typeof exceptionResponse === 'object' &&
            exceptionResponse !== null &&
            'message' in exceptionResponse
                ? exceptionResponse.message
                : exception instanceof Error
                  ? exception.message
                  : 'Internal server error.';

        response.status(statusCode).json({
            success: false,
            statusCode,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
