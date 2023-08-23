import { BaseEntity } from '../../../common/entities/base.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class GuardianShip extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //the user doing the following
  @ManyToOne(() => User, (user) => user.parents, {
    onDelete: 'CASCADE'
  })
  parent: User;

  //the user being followed
  @ManyToOne(() => User, (user) => user.children, {
    onDelete: 'CASCADE'
  })
  child: User;
}
