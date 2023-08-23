import { EncryptionService } from '../../../common/services/encryption.service';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Action } from '../enums/action.enum';
import { Ticket } from './ticket.entity';

@Entity()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: Action;

  @Column()
  timestamp: Date;

  //A Report can only be posted by one user but a user can have many Reports
  @ManyToOne(() => Ticket, (ticket) => ticket.activities, {
    onDelete: 'CASCADE'
  })
  ticket: Ticket;
}
