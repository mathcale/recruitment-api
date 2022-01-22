import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../../users/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => {
      const hasRequiredRole = user.role && user.role === role;

      if (!hasRequiredRole) {
        this.logger.warn(
          `User [${user.id}] is not allowed to invoke [${context.getClass().name}.${
            context.getHandler().name
          }]!`,
        );
      }

      return hasRequiredRole;
    });
  }
}
