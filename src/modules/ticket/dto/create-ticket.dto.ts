import { IsNotEmpty } from 'class-validator';

/**
 * This is the DTO for creating a reports for both user and post
 */
export class CreateTicketDto {
  @IsNotEmpty()
  dropOffAddress: string;

  @IsNotEmpty()
  lon: number;

  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  seatNumber: number;

  @IsNotEmpty()
  dropOffTime: string;
}
