import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof BadRequestException) {
      // Handle validation errors
      const validationErrors = exception.getResponse();
      if (
        typeof validationErrors === 'object' &&
        'message' in validationErrors
      ) {
        message = 'Validation failed';
        errors = this.flattenValidationErrors(validationErrors.message);
      }
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      errors: errors,
    });
  }

  private flattenValidationErrors(validationErrors: unknown): string[] {
    const errors: string[] = [];

    if (Array.isArray(validationErrors)) {
      for (const error of validationErrors) {
        if (typeof error === 'string') {
          errors.push(error);
        } else if (error instanceof ValidationError && error.constraints) {
          for (const key in error.constraints) {
            if (error.constraints.hasOwnProperty(key)) {
              errors.push(error.constraints[key]);
            }
          }
        }
      }
    }

    return errors;
  }
}
