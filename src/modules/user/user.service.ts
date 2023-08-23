import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpUserDto } from '../auth/dto/user-signup.dto';
import { GuardianShip } from './entities/guardianship.entity';
import { log } from 'console';

@Injectable()
export class UserService {
  /**
   * We use the repository to interact with the database
   * @param usersRepository the user repository that will be injected by the nestjs
   */
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(GuardianShip)
    private guardianshipRepository: Repository<GuardianShip>
  ) {}

  /**
   * Creates a new user object and saves it in the database
   * @param user the user object that contains the user information
   * @returns the newly created user
   */
  createUser(user: SignUpUserDto): Promise<User> {
    const newUser = new User();
    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.email = user.email;
    newUser.username = user.username;
    newUser.password = user.password;
    newUser.phoneNumber = user.phoneNumber;
    newUser.eid = user.eid;
    newUser.accountType = user.accountType;

    return this.usersRepository.save(newUser);
  }
  /**
   * Gets the user with the email passed in the parameter
   * @param email the email of the user
   * @returns the user with the email passed in the parameter
   */
  findOneByEmail(email: string): Promise<User> {
    //Look in the users table for one user with the email as the email passed in the parameter
    return this.usersRepository.findOneBy({ email });
  }

  getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id: id } });
  }

  async addChild(user: User, email: string): Promise<GuardianShip> {
    const child = await this.findOneByEmail(email);

    if (!child) {
      throw new BadRequestException('No user with this email');
    }

    const guardianship = new GuardianShip();
    guardianship.parent = user;
    guardianship.child = child;

    return this.guardianshipRepository.save(guardianship);
  }

  async getChildren(user: User): Promise<User[]> {
    const relationships = await this.usersRepository
      .findOne({ where: { id: user.id }, relations: ['children.child'] })
      .then((user) => {
        return user.children;
      });

    const children = relationships.map((relationship) => {
      return relationship.child;
    });

    return children;
  }

  async getProfile(user: User): Promise<User> {
    return this.usersRepository.findOne({ where: { id: user.id } });
  }
}
