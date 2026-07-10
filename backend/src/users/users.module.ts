import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AdminSeederService } from './admin-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, AdminSeederService],
  exports: [UsersService],
})
export class UsersModule {}
