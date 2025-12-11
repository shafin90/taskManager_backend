import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const logger = new Logger('RolesGuard');
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawUser = request.user as any;
    let role = rawUser?.role || rawUser?.payload?.role || rawUser?.roles?.[0];
    let orgId = rawUser?.orgId;

    const userId = rawUser?.userId || rawUser?.sub || rawUser?._id;
    const email = rawUser?.email;

    // Fallback: fetch user to get role/org if missing
    if ((!role || !orgId) && (userId || email)) {
      try {
        const dbUser = userId
          ? await this.usersService.findById(userId)
          : email
            ? await this.usersService.findByEmail(email)
            : null;
        if (dbUser) {
          role = role || dbUser.role;
          orgId = orgId || dbUser.orgId;
        }
      } catch {
        // ignore fetch errors, will fail below
      }
    }

    const user = { ...rawUser, role, orgId };

    logger.debug(
      JSON.stringify(
        {
          path: request.url,
          requiredRoles,
          tokenRole: rawUser?.role,
          payloadRole: rawUser?.payload?.role,
          rolesArray: rawUser?.roles,
          resolvedRole: role,
          userId,
          email,
          orgId,
        },
        null,
        2,
      ),
    );

    if (!user.role) {
      // Last resort: allow owner-only routes if we have a user identity
      if ((userId || email) && requiredRoles.includes('owner')) {
        return true;
      }
      throw new ForbiddenException('Missing role; please log in again.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You are not allowed to perform this action');
    }

    return true;
  }
}

