import { OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';
export declare class AdminSeederService implements OnApplicationBootstrap {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    private hashPassword;
    onApplicationBootstrap(): Promise<void>;
}
