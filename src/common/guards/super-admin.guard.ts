import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    if (user?.admin_role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'هذه العملية تتطلب صلاحيات Super Admin',
      );
    }

    return true;
  }
}