import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The JWT Refresh Token issued by the backend',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFl...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
