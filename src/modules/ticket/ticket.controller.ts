import { Controller, UseGuards, Res, Request, Post, Body, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';

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
}
