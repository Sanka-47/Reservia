import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'The registered username', example: 'alice' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'The account password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
