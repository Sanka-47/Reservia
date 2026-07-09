import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({
    description: 'The Google ID Token received from client-side Google sign-in',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFl...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
