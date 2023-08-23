import { Injectable } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../user/entities/user.entity';
import { schoolClusters } from './school-data';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>
  ) {}

  createTicket(user: User, createTicketDto: CreateTicketDto): Promise<Ticket> {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    const newTicket = new Ticket();
    newTicket.activationDate = new Date();
    newTicket.expirationDate = expirationDate;
    newTicket.expired = false;
    newTicket.seatNumber = this.getSeatNumber();
    newTicket.busCode = this.getBusNumber(createTicketDto.dropOffAddress);
    newTicket.clusterNumber = this.getCluster(createTicketDto.dropOffAddress);
    newTicket.user = user;

    return this.ticketRepository.save(newTicket);
  }

  getSeatNumber(): number {
    return Math.floor(Math.random() * 50) + 1;
  }

  getBusNumber(dropOffAddress: string): string {
    const acronym = dropOffAddress
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');

    return acronym;
  }

  getCluster(dropOffAddress: string): number {
    const school = schoolClusters.filter((school) => {
      if (school['School Name'] === dropOffAddress) {
        return school['cluster'];
      }
    });
    return school[0]['cluster'];
  }
}
