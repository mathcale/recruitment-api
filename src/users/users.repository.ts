import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

export enum PostgresErrorCode {
  UniqueViolation = '23505',
}

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  async createUser(createUserInput: CreateUserInput): Promise<User | never> {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(createUserInput.password, salt);

    const user = this.create({
      name: createUserInput.name,
      email: createUserInput.email,
      password: hashedPassword,
      role: createUserInput.role,
    });

    this.logger.log('Saving new user on database...');

    return this.save(user);
  }
}
