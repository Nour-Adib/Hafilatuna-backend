import {
  Controller,
  UseGuards,
  Res,
  Request,
  Post,
  Body,
  HttpStatus,
  Get,
  Param
} from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateChildTicketDto } from './dto/create-child-ticket.dto';
import { AccountTypeGuard } from '../auth/guards/account-type.guard';
import { Accounts } from 'src/decorators/account-type.decorator';
import { AccountType } from 'src/common/enum/account-type.enum';

@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createTicket(@Body() body: CreateTicketDto, @Request() req, @Res() res: Response) {
    this.ticketService
      .createTicket(req.user, body)
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
  @Post('create-for-child')
  createTicketForChild(@Body() body: CreateChildTicketDto, @Request() req, @Res() res: Response) {
    this.ticketService
      .createTicketForChild(req.user, body)
      .then((report) => {
        return res.status(HttpStatus.OK).json(report);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  getTickets(@Request() req, @Res() res: Response) {
    this.ticketService
      .getTickets(req.user)
      .then((tickets) => {
        return res.status(HttpStatus.OK).json(tickets);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post('activity/pickup/:id')
  pickupActivity(@Request() req, @Res() res: Response, @Param('id') ticketId) {
    this.ticketService
      .pickupActivity(req.user, ticketId)
      .then((activities) => {
        return res.status(HttpStatus.OK).json(activities);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post('activity/dropoff/:id')
  dropoffActivity(@Request() req, @Res() res: Response, @Param('id') ticketId) {
    this.ticketService
      .dropoffActivity(req.user, ticketId)
      .then((activities) => {
        return res.status(HttpStatus.OK).json(activities);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @Get('data-dump')
  dataDump(@Res() res: Response) {
    this.ticketService.dataDump();
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-en-route/:id')
  isEnRoute(@Request() req, @Res() res: Response, @Param('id') ticketId) {
    this.ticketService
      .isEnRoute(req.user, ticketId)
      .then((data) => {
        return res.status(HttpStatus.OK).json(data);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getTicketById(@Request() req, @Res() res: Response, @Param('id') ticketId) {
    this.ticketService
      .getTicketById(req.user, ticketId)
      .then((activities) => {
        return res.status(HttpStatus.OK).json(activities);
      })
      .catch((err) => {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
      });
  }
}
