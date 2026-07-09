import { IsNotEmpty, IsString, IsEmail, IsUUID, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Customer full name', example: 'Alice Smith' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Customer email address', example: 'alice@example.com' })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiProperty({ description: 'ID of the service being booked', example: '85e78c8c-1e24-4f81-9b4c-9f899e4f5a3b' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Booking date (format: YYYY-MM-DD)', example: '2026-07-15' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'bookingDate must be in YYYY-MM-DD format' })
  bookingDate: string;

  @ApiProperty({ description: 'Booking time (format: HH:MM)', example: '14:30' })
  @IsNotEmpty()
  @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'bookingTime must be in HH:MM format' })
  bookingTime: string;

  @ApiProperty({ description: 'Optional notes from customer', example: 'Prefer a window seat if possible.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
