import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerUserDto: RegisterUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
            gender: string;
            phoneNumber: string;
            dob: string;
        };
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
