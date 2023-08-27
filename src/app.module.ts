import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { User } from './modules/user/entities/user.entity';
import { UserModule } from './modules/user/user.module';
import { Ticket } from './modules/ticket/entities/ticket.entity';
import { Activity } from './modules/ticket/entities/activity.entity';
import { GuardianShip } from './modules/user/entities/guardianship.entity';
import { School } from './modules/ticket/entities/school.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      //We import the ConfigModule to use the ConfigService to access the environment variables
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        //*Database Settings
        type: 'mysql',
        //We get get the value of the environment variable DATABASE_HOST
        host: configService.get<string>('DATABASE_HOST'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Ticket, Activity, GuardianShip, School],
        synchronize: true,
        autoLoadEntities: true,
        options: { encrypt: false },
        //*Migrations Settings
        //Migrations Table Name
        migrationsTableName: 'migrations',
        //Migrations Folder
        migrations: ['../migrations/*{.ts,.js}'],
        //Automatically run migrations on app start if needed
        migrationsRun: true,
        port: 3306
      }),
      inject: [ConfigService]
    }),
    UserModule,
    AuthModule,
    TicketModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
