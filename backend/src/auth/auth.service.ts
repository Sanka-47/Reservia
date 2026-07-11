import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(registerDto: RegisterUserDto) {
    const { username, password, email, name, gender, phoneNumber, dob } =
      registerDto;

    // Check if username already exists
    let existing = await this.usersService.findOneByUsername(username);
    if (existing) {
      throw new ConflictException('Username is already taken');
    }

    // Check if email already exists
    existing = await this.usersService.findOneByEmail(email);
    if (existing) {
      throw new ConflictException('Email address is already registered');
    }

    // Create user (default role is CUSTOMER)
    const passwordHash = this.hashPassword(password);
    const user = await this.usersService.create({
      username,
      passwordHash,
      email,
      name,
      gender,
      phoneNumber,
      dob,
      role: UserRole.CUSTOMER,
    });

    return this.generateTokensResponse(user);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const inputHash = this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new UnauthorizedException('Invalid username or password');
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
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') ??
        'super_secret_jwt_key_change_me',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'super_secret_refresh_jwt_key_change_me',
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
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
      },
    };
  }
}
