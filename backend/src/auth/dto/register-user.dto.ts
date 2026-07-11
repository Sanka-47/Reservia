import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'Unique username', example: 'alice' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password (min 6 characters)',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'Full name', example: 'Alice Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'alice@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Gender description', example: 'Female' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Date of Birth (format: YYYY-MM-DD)',
    example: '1995-10-15',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dob must be in YYYY-MM-DD format',
  })
  dob: string;
}
