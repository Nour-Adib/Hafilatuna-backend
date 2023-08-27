import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Activity } from './entities/activity.entity';
import { School } from './entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Activity, School])],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketModule {}
