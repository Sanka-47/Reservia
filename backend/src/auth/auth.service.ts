import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { GoogleAuthService } from './google-auth.service';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async registerGoogle(token: string) {
    const googlePayload = await this.googleAuthService.verify(token);

    // Check if user already exists
    let user = await this.usersService.findOneByGoogleId(googlePayload.googleId);
    if (!user) {
      user = await this.usersService.findOneByEmail(googlePayload.email);
    }

    if (user) {
      throw new ConflictException('User with this email or Google account already registered');
    }

    // Create new user
    const newUser = await this.usersService.create({
      email: googlePayload.email,
      name: googlePayload.name,
      googleId: googlePayload.googleId,
    });

    return this.generateTokensResponse(newUser);
  }

  async loginGoogle(token: string) {
    const googlePayload = await this.googleAuthService.verify(token);

    // Find user by googleId
    let user = await this.usersService.findOneByGoogleId(googlePayload.googleId);
    if (!user) {
      // Or find by email (if they registered by email or we want to link accounts)
      user = await this.usersService.findOneByEmail(googlePayload.email);
      if (user) {
        // Link googleId if missing
        user = await this.usersService.update(user.id, { googleId: googlePayload.googleId });
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not registered. Please register first.');
    }

    return this.generateTokensResponse(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const userId = payload.sub;
      const user = await this.usersService.findOneById(userId);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access denied or invalid session');
      }

      // Verify refresh token hash matches
      const tokenHash = this.hashToken(refreshToken);
      if (user.refreshTokenHash !== tokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokensResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }

  private async generateTokensResponse(user: User) {
    const payload = { sub: user.id, email: user.email };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    // Hash and store the refresh token
    const refreshTokenHash = this.hashToken(refreshToken);
    await this.usersService.update(user.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
