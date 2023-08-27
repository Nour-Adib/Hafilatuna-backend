import { IsNotEmpty } from 'class-validator';
import { School } from '../entities/school.entity';

/**
 * This is the DTO for creating a reports for both user and post
 */
export class EnRouteResponseDto {
  @IsNotEmpty()
  school: School;

  @IsNotEmpty()
  pickUpLon: string;

  @IsNotEmpty()
  pickUpLat: string;

  @IsNotEmpty()
  isEnRoute: boolean;
}
