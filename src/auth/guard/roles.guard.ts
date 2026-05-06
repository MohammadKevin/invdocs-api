import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface UserPayload {
  role?: string;
}

interface RequestWithUser extends Request {
  user?: UserPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    console.log('USER:', request.user);
    console.log('ROLES:', roles);

    const user = request.user;

    if (!user) return false;

    return roles.includes(user.role ?? '');
  }
}
