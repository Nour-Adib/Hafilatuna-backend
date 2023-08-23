import { EncryptionService } from '../../../common/services/encryption.service';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

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

  //A Report can only be posted by one user but a user can have many Reports
  @ManyToOne(() => User, (user) => user.tickets, {
    onDelete: 'CASCADE'
  })
  user: User;
}
