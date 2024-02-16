import { BadRequestException, Injectable } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../user/entities/user.entity';
import { CreateChildTicketDto } from './dto/create-child-ticket.dto';
import { AccountType } from 'src/common/enum/account-type.enum';
import { Activity } from './entities/activity.entity';
import { Action } from './enums/action.enum';
import { School } from './entities/school.entity';
import { EnRouteResponseDto } from './dto/en-route-response.dto';
import { schoolClusters } from './school-data';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) { }

  async createTicket(user: User, createTicketDto: CreateTicketDto): Promise<Ticket> {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    const school = await this.schoolRepository.findOne({
      where: { schoolName: createTicketDto.dropOffAddress }
    });

    const userr = await this.userRepository.findOne({ where: { id: user.id } });

    const newTicket = new Ticket();
    newTicket.activationDate = new Date();
    newTicket.expirationDate = expirationDate;
    newTicket.expired = false;
    newTicket.seatNumber = createTicketDto.seatNumber;
    newTicket.busCode = this.getBusNumber(school.schoolName);
    newTicket.school = school;
    newTicket.studentHub = this.getStudentHub(createTicketDto.lon, createTicketDto.lat);
    newTicket.clusterNumber = school.clusterNumber;
    newTicket.user = userr;

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

    const school = await this.schoolRepository.findOne({
      where: { schoolName: createChildTicketDto.dropOffAddress }
    });

    const newTicket = new Ticket();
    newTicket.activationDate = new Date();
    newTicket.expirationDate = expirationDate;
    newTicket.expired = false;
    newTicket.seatNumber = createChildTicketDto.seatNumber;
    newTicket.busCode = this.getBusNumber(school.schoolName);
    newTicket.school = school;
    newTicket.clusterNumber = school.clusterNumber;
    newTicket.user = child;

    return this.ticketRepository.save(newTicket);
  }

  getBusNumber(dropOffAddress: string): string {
    const acronym = dropOffAddress
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');

    return acronym;
  }

  getStudentHub(lon: number, lat: number): string {
    /* const coordinatesList: number[][] = schoolClusters.map((entry) => {
      return entry.center;
    });

    const closestCoordinate = this.closestCoordinate([lon, lat], coordinatesList); */
    return '25.233912, 55.355400';
  }

  async getTickets(user: User): Promise<Ticket[]> {
    const childrensTickets = [];
    if (user.accountType == AccountType.Parent) {
      const relationships = await this.userRepository
        .findOne({
          where: { id: user.id },
          relations: ['children.child.tickets.user', 'children.child.tickets.activities']
        })
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
      .leftJoinAndSelect('Ticket.activities', 'Activity')
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
      .leftJoinAndSelect('Ticket.school', 'School')
      .where('Ticket.id = :ticketId', { ticketId: ticketId })
      .orderBy('Activity.createdAt', 'DESC')
      .getOne();
  }

  async pickupActivity(user: User, ticketId: string): Promise<Activity> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    const userWithPoints = await this.userRepository.findOne({
      where: { id: user.id }
    });

    ticket.activities.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastIndex = ticket.activities.length - 1;

    if (ticket.activities.length != 0 && ticket.activities[lastIndex].action == Action.PickUp) {
      throw new BadRequestException('Ticket already picked up');
    }
    const activity = new Activity();
    activity.action = Action.PickUp;
    activity.timestamp = new Date();
    activity.ticket = ticket;

    userWithPoints.points += 1;
    console.log(user);

    const updatedUser = await this.userRepository.save(userWithPoints);
    console.log('Updated user:', updatedUser);
    return this.activityRepository.save(activity);
  }

  async dropoffActivity(user: User, ticketId: string): Promise<Activity> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['activities']
    });

    const userWithPoints = await this.userRepository.findOne({
      where: { id: user.id }
    });

    ticket.activities.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const lastIndex = ticket.activities.length - 1;

    if (ticket.activities.length != 0 && ticket.activities[lastIndex].action == Action.DropOff) {
      throw new BadRequestException('Ticket already dropped off');
    }
    const activity = new Activity();
    activity.action = Action.DropOff;
    activity.timestamp = new Date();
    activity.ticket = ticket;

    userWithPoints.points += 1;
    console.log(user);

    const updatedUser = await this.userRepository.save(userWithPoints);
    console.log('Updated user:', updatedUser);

    return this.activityRepository.save(activity);
  }

  async isEnRoute(user: User, ticketId: string): Promise<EnRouteResponseDto> {
    const ticket = await this.getTicketById(user, ticketId);

    if (ticket.activities.length == 0) {
      const enRouteResponse = new EnRouteResponseDto();
      enRouteResponse.isEnRoute = false;
      enRouteResponse.school = ticket.school;
      enRouteResponse.pickUpLat = '25.233912';
      enRouteResponse.pickUpLon = '55.3554';

      return enRouteResponse;
    }

    if (ticket.activities[0].action == Action.PickUp) {
      const enRouteResponse = new EnRouteResponseDto();
      enRouteResponse.isEnRoute = true;
      enRouteResponse.school = ticket.school;
      enRouteResponse.pickUpLat = '25.233912';
      enRouteResponse.pickUpLon = '55.3554';

      return enRouteResponse;
    }

    const enRouteResponse = new EnRouteResponseDto();
    enRouteResponse.isEnRoute = false;
    enRouteResponse.school = ticket.school;
    enRouteResponse.pickUpLat = '25.233912';
    enRouteResponse.pickUpLon = '55.3554';

    return enRouteResponse;
  }

  closestCoordinate(target: number[], coordinates: number[][]): number[] {
    let minDistance = Infinity;
    let closestCoord: number[] | null = null;

    for (const coord of coordinates) {
      const distance = Math.sqrt(
        Math.pow(target[0] - coord[0], 2) + Math.pow(target[1] - coord[1], 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestCoord = coord;
      }
    }

    if (closestCoord) {
      return closestCoord;
    }

    // In case there are no coordinates provided
    return [0, 0];
  }

  async dataDump() {
    await schoolClusters.map(async (entry) => {

      const newSchol = new School();
      newSchol.schoolName = entry['School Name'];
      newSchol.clusterNumber = entry['Cluster Number'];
      newSchol.latitude = entry['Latitude'];
      newSchol.longitude = entry['Longitude'];
      newSchol.clusterNumber = entry['Cluster'];


      this.schoolRepository.save(newSchol);
    });
  }
}
