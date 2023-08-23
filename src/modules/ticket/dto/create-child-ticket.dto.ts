import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * This is the DTO for creating a reports for both user and post
 */
export class CreateChildTicketDto {
  @IsNotEmpty()
  @IsUUID()
  childId: string;

  @IsNotEmpty()
  dropOffAddress: string;

  @IsNotEmpty()
  pickUpAddress: string;

  @IsNotEmpty()
  dropOffTime: string;
}
