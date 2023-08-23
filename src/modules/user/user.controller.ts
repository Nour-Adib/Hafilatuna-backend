import { Controller, UseGuards, Res, Request, Post, HttpStatus, Query, Get } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { AccountTypeGuard } from '../auth/guards/account-type.guard';
import { Accounts } from 'src/decorators/account-type.decorator';
import { AccountType } from 'src/common/enum/account-type.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @Accounts(AccountType.Parent)
  @Post('add-child')
  createTicket(@Query('email') email: string, @Request() req, @Res() res: Response) {
    this.userService
      .addChild(req.user, email)
      .then((report) => {
        return res.status(HttpStatus.OK).json(report);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @Accounts(AccountType.Parent)
  @Get('children')
  getChildren(@Request() req, @Res() res: Response) {
    this.userService
      .getChildren(req.user)
      .then((report) => {
        return res.status(HttpStatus.OK).json(report);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }
}
