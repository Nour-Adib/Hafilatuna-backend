import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { AccountType } from 'src/common/enum/account-type.enum';

export class SignUpUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  eid: string;

  @IsPhoneNumber('AE')
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}
