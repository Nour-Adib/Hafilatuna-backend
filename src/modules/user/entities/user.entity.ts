import { EncryptionService } from '../../../common/services/encryption.service';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import { Ticket } from 'src/modules/ticket/entities/ticket.entity';
import { Activity } from 'src/modules/ticket/entities/activity.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ default: '' })
  eid: string = '';

  //A user can report many posts
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  ticket: Ticket[];

  //A user can report many posts
  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await new EncryptionService().encryptPassword(this.password);
  }
}
