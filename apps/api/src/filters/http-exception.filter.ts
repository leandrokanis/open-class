import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';
import { formatI18nErrors } from 'nestjs-i18n/dist/utils';
import type { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const message =
      exception instanceof I18nValidationException
        ? this.translateValidation(exception)
        : this.extractMessage(exception);

    response.status(status).json({
      error: Array.isArray(message) ? message.join('; ') : message,
      statusCode: status,
    });
  }

  private extractMessage(exception: HttpException): string | string[] {
    const exceptionResponse = exception.getResponse();
    return typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as { message?: string | string[] }).message ?? exception.message;
  }

  private translateValidation(exception: I18nValidationException): string[] {
    const i18n = I18nContext.current();
    const errors = i18n
      ? formatI18nErrors(exception.errors ?? [], i18n.service, { lang: i18n.lang })
      : (exception.errors ?? []);
    return this.flattenConstraints(errors);
  }

  private flattenConstraints(errors: ValidationError[]): string[] {
    const messages: string[] = [];
    for (const error of errors) {
      if (error.constraints) messages.push(...Object.values(error.constraints));
      if (error.children?.length) messages.push(...this.flattenConstraints(error.children));
    }
    return messages;
  }
}
