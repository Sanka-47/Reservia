import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleTokenDto } from './dto/google-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/google')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new administrator using Google ID Token' })
  @ApiResponse({ status: 201, description: 'User successfully registered and authenticated.' })
  @ApiResponse({ status: 400, description: 'Invalid token or token verification failed.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  registerGoogle(@Body() googleTokenDto: GoogleTokenDto) {
    return this.authService.registerGoogle(googleTokenDto.token);
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an administrator using Google ID Token' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated.' })
  @ApiResponse({ status: 400, description: 'Invalid token or token verification failed.' })
  @ApiResponse({ status: 401, description: 'User not registered.' })
  loginGoogle(@Body() googleTokenDto: GoogleTokenDto) {
    return this.authService.loginGoogle(googleTokenDto.token);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT Access and Refresh Tokens' })
  @ApiResponse({ status: 200, description: 'New token pair generated successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log out the authenticated user and invalidate their refresh token' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
