import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Always allow request to proceed
        return super.canActivate(context) as boolean;
    }

    handleRequest(err, user, info) {
        // ❗ Key difference: NEVER throw
        // If token invalid or missing → just return null
        return user || null;
    }
}