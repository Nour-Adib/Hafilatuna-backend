import { BadRequestException, Injectable } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../user/entities/user.entity';
import { schoolClusters } from './school-data';
import { UserService } from '../user/user.service';
import { CreateChildTicketDto } from './dto/create-child-ticket.dto';
import { AccountType } from 'src/common/enum/account-type.enum';
import { Activity } from './entities/activity.entity';
import { Action } from './enums/action.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>
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

  async createTicketForChild(
    user: User,
    createChildTicketDto: CreateChildTicketDto
  ): Promise<Ticket> {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    const child = await this.userRepository.findOne({
      where: { id: createChildTicketDto.childId },
      relations: ['parents.parent']
    });

    if (!child) {
      throw new BadRequestException('Child not found');
    }

    if (!child.parents.some((guardianship) => guardianship.parent.id === user.id)) {
      throw new BadRequestException('You are not the guardian of this child');
    }

    const newTicket = new Ticket();
    newTicket.activationDate = new Date();
    newTicket.expirationDate = expirationDate;
    newTicket.expired = false;
    newTicket.seatNumber = this.getSeatNumber();
    newTicket.busCode = this.getBusNumber(createChildTicketDto.dropOffAddress);
    newTicket.clusterNumber = this.getCluster(createChildTicketDto.dropOffAddress);
    newTicket.user = child;

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

  async getTickets(user: User): Promise<Ticket[]> {
    const childrensTickets = [];
    if (user.accountType == AccountType.Parent) {
      const relationships = await this.userRepository
        .findOne({ where: { id: user.id }, relations: ['children.child.tickets.user11'] })
        .then((user) => {
          return user.children;
        });

      const tickets = relationships.map((relationship) => {
        return relationship.child.tickets;
      })[0];

      childrensTickets.push(...tickets);
    }

    console.log(childrensTickets);

    const tickets = await this.ticketRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Ticket.user', 'User')
      .where('User.id = :id', { id: user.id })
      .getMany();

    tickets.push(...childrensTickets);

    return tickets;
  }

  getTicketById(user: User, ticketId: string): Promise<Ticket> {
    return this.ticketRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Ticket.user', 'User')
      .leftJoinAndSelect('Ticket.activities', 'Activity')
      .where('Ticket.id = :ticketId', { ticketId: ticketId })
      .orderBy('Activity.createdAt', 'DESC')
      .getOne();
  }

  async pickupActivity(user: User, ticketId: string): Promise<Activity> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    ticket.activities.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastIndex = ticket.activities.length - 1;

    if (ticket.activities[lastIndex].action == Action.PickUp) {
      throw new BadRequestException('Ticket already picked up');
    }
    const activity = new Activity();
    activity.action = Action.PickUp;
    activity.timestamp = new Date();
    activity.ticket = ticket;

    return this.activityRepository.save(activity);
  }

  async dropoffActivity(user: User, ticketId: string): Promise<Activity> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    ticket.activities.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastIndex = ticket.activities.length - 1;

    if (ticket.activities[lastIndex].action == Action.DropOff) {
      throw new BadRequestException('Ticket already dropped off');
    }
    const activity = new Activity();
    activity.action = Action.DropOff;
    activity.timestamp = new Date();
    activity.ticket = ticket;

    return this.activityRepository.save(activity);
  }
}
