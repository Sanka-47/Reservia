import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsPositive,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The title of the service',
    example: 'Haircut & Styling',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the service',
    example: 'A professional haircut including wash and dry.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 45,
  })
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiProperty({ description: 'Price of the service', example: 35.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Whether the service is active and bookable',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
