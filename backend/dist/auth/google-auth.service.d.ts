import { ConfigService } from '@nestjs/config';
export declare class GoogleAuthService {
    private readonly configService;
    private client;
    constructor(configService: ConfigService);
    verify(token: string): Promise<{
        email: string;
        name: string;
        googleId: string;
    }>;
}
