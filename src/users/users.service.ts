import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(UsersRepository) private usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | never> {
    this.logger.log(`Fetching user with email [${email}]...`);

    const foundUser = await this.usersRepository.findOne({ email });

    if (!foundUser) {
      this.logger.error(`User with email [${email}] not found!`);
      throw new NotFoundException();
    }

    this.logger.log('User found, returning it...');

    return foundUser;
  }

  async findByExternalId(externalId: string): Promise<User | never> {
    this.logger.log(`Fetching user with externalId [${externalId}]...`);

    const foundUser = await this.usersRepository.findOne({ externalId });

    if (!foundUser) {
      this.logger.error(`User with externalId [${externalId}] not found!`);
      throw new NotFoundException();
    }

    this.logger.log('User found, returning it...');

    return foundUser;
  }

  async findApplications(jobExternalId: string, page: number = 1, pageSize: number = 10) {
    return this.usersRepository.findApplications(jobExternalId, page, pageSize);
  }

  async create(createUserInput: CreateUserInput): Promise<User | never> {
    return this.usersRepository.createUser(createUserInput);
  }
}
