import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimBookingsDto {
  @ApiProperty({
    description: 'Array of booking UUIDs to claim',
    example: ['85e78c8c-1e24-4f81-9b4c-9f899e4f5a3b'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  bookingIds: string[];
}
