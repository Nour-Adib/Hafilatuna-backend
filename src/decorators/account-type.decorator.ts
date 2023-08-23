import { SetMetadata } from '@nestjs/common';
import { AccountType } from 'src/common/enum/account-type.enum';

export const ACCOUNT_KEYS = 'accounts';
export const Accounts = (...accounts: AccountType[]) => SetMetadata(ACCOUNT_KEYS, accounts);
