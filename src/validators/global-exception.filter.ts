import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationError } from 'class-validator';

interface ErrorResponse {
  message: string | string[];
  [key: string]: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse() as ErrorResponse;
      status = HttpStatus.BAD_REQUEST;

      if (validationErrors && typeof validationErrors === 'object') {
        message = 'Validation failed';
        errors = this.flattenValidationErrors(validationErrors.message);
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error for debugging in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Exception caught:', exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  private flattenValidationErrors(validationErrors: unknown): string[] {
    const errors: string[] = [];

    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((error) => {
        if (typeof error === 'string') {
          errors.push(error);
        } else if (this.isValidationError(error)) {
          Object.values(error.constraints || {}).forEach((constraint) => {
            errors.push(constraint);
          });
        }
      });
    }

    return errors;
  }

  private isValidationError(error: unknown): error is ValidationError {
    return (
      error instanceof ValidationError ||
      (typeof error === 'object' && error !== null && 'constraints' in error)
    );
  }
}
