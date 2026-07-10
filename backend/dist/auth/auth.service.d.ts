import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    private hashPassword;
    private hashToken;
    register(registerDto: RegisterUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    login(username: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokensResponse;
}
