import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';

export enum PostgresErrorCode {
  UniqueViolation = '23505',
}

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  async findApplications(jobExternalId: string, page: number = 1, pageSize: number = 10) {
    const query = `SELECT u."externalId", u.name, u.email, u.role, u."createdAt", u."updatedAt", u."deletedAt" FROM "user" u INNER JOIN job_applications ja ON u.id = ja."userId" INNER JOIN job j ON ja."jobId" = j.id WHERE j."externalId" = $1 LIMIT $2 OFFSET $3`;

    return this.query(query, [jobExternalId, pageSize, (page - 1) * pageSize]);
  }

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
