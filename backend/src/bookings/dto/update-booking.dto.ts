import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiProperty({ description: 'Customer full name', example: 'Alice Smith', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Customer email address', example: 'alice@example.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Rescheduled booking date (format: YYYY-MM-DD)', example: '2026-07-16', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'bookingDate must be in YYYY-MM-DD format' })
  bookingDate?: string;

  @ApiProperty({ description: 'Rescheduled booking time (format: HH:MM)', example: '15:00', required: false })
  @IsOptional()
  @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'bookingTime must be in HH:MM format' })
  bookingTime?: string;

  @ApiProperty({ description: 'Updated notes', example: 'Moved to next day.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
