import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { UsersModule } from '../users/users.module';
import { JobsRepository } from './jobs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JobsRepository]), UsersModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
