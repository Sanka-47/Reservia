import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { GoogleAuthService } from './google-auth.service';
export declare class AuthService {
    private readonly usersService;
    private readonly googleAuthService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, googleAuthService: GoogleAuthService, jwtService: JwtService, configService: ConfigService);
    private hashToken;
    registerGoogle(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    loginGoogle(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokensResponse;
}
