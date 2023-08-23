import { EncryptionService } from '../../../common/services/encryption.service';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import { Ticket } from 'src/modules/ticket/entities/ticket.entity';
import { Activity } from 'src/modules/ticket/entities/activity.entity';
import { AccountType } from 'src/common/enum/account-type.enum';
import { GuardianShip } from './guardianship.entity';

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

  @Column({ default: AccountType.Standalone })
  accountType: AccountType = AccountType.Standalone;

  //A user can have many tickets
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  //A user can have many activities
  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  //A user can follow many users
  @OneToMany(() => GuardianShip, (guardianship) => guardianship.parent)
  children: GuardianShip[];

  //A user can be followed by many users
  @OneToMany(() => GuardianShip, (guardianship) => guardianship.child)
  parents: GuardianShip[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await new EncryptionService().encryptPassword(this.password);
  }
}
