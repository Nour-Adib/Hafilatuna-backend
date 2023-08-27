import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Activity } from './activity.entity';
import { School } from './school.entity';

@Entity()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  activationDate: Date;

  @Column()
  expirationDate: Date;

  @Column({ select: false })
  expired: boolean;

  @Column()
  seatNumber: number;

  @Column()
  busCode: string;

  @Column()
  clusterNumber: number;

  @Column()
  studentHub: string;

  //A Report can only be posted by one user but a user can have many Reports
  @ManyToOne(() => User, (user) => user.tickets, {
    onDelete: 'CASCADE'
  })
  user: User;

  //A Report can only be posted by one user but a user can have many Reports
  @ManyToOne(() => School, (school) => school.tickets, {
    onDelete: 'CASCADE'
  })
  school: School;

  //A user can have many activities
  @OneToMany(() => Activity, (activity) => activity.ticket)
  activities: Activity[];
}
