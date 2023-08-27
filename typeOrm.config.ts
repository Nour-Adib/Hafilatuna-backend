import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from './src/modules/user/entities/user.entity';
import { Ticket } from './src/modules/ticket/entities/ticket.entity';
import { Activity } from './src/modules/ticket/entities/activity.entity';
import { GuardianShip } from './src/modules/user/entities/guardianship.entity';
import { School } from 'src/modules/ticket/entities/school.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DATABASE_HOST'),
  username: configService.get('DATABASE_USERNAME'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [User, Ticket, Activity, GuardianShip, School],
  migrations: ['./migrations/*{.ts,.js}'],
  port: 33060
});
