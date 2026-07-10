import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(private readonly usersService: UsersService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async onApplicationBootstrap() {
    try {
      const existingAdmin = await this.usersService.findOneByUsername('admin');
      if (!existingAdmin) {
        this.logger.log('Seeding default administrator user...');
        await this.usersService.create({
          username: 'admin',
          passwordHash: this.hashPassword('admin'),
          name: 'System Administrator',
          email: 'admin@reservia.com',
          gender: 'Other',
          phoneNumber: '0000000000',
          dob: '1970-01-01',
          role: UserRole.ADMIN,
        });
        this.logger.log('Default administrator user seeded successfully (username=admin, password=admin)');
      } else {
        this.logger.log('Administrator user already exists. Skipping seed.');
      }
    } catch (error: any) {
      this.logger.error('Failed to seed administrator user:', error.message);
    }
  }
}
