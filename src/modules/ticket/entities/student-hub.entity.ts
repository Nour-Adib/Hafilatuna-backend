import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Activity } from './activity.entity';
import { Ticket } from './ticket.entity';

@Entity()
export class School extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  schoolName: string;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  clusterNumber: number;

  //A user can have many activities
  @OneToMany(() => Ticket, (ticket) => ticket.school)
  tickets: Ticket[];
}
