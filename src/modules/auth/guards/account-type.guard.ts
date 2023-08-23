import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountType } from 'src/common/enum/account-type.enum';
import { ACCOUNT_KEYS } from 'src/decorators/account-type.decorator';

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<AccountType[]>(ACCOUNT_KEYS, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredTypes) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    return requiredTypes.some((accountType) => user.accountType?.includes(accountType));
  }
}
