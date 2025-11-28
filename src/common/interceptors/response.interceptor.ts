import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        // If paginated result (contains data + meta)
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            status: 'success',
            message: data.message ?? 'Request successful',
            data: data.data,
            meta: data.meta,
          };
        }

        // Default (normal response / no pagination)
        return {
          status: 'success',
          message: data?.message ?? 'Request successful',
          data: data?.data ?? data,
        };
      }),
    );
  }
}
