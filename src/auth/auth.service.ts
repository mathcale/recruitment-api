import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateUserInput } from '../users/dto/create-user.input';
import { JwtPayload } from './jwt.strategy';
import { PostgresErrorCode } from '../users/users.repository';
import { RegisterCandidateInput } from './dto/register-candidate.input';
import { Role } from '../users/enums/role.enum';
import { SignInInput } from './dto/sign-in.input';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersService: UsersService) {}

  async signIn(signInInput: SignInInput): Promise<any | never> {
    return;
  }

  public async registerCandidate(
    registerCandidateInput: RegisterCandidateInput,
  ): Promise<void | never> {
    try {
      this.logger.log('Registering new user of role CANDIDATE...');

      // FIXME: refactor to mapper class
      const createUserInput: CreateUserInput = new CreateUserInput();
      createUserInput.name = registerCandidateInput.name;
      createUserInput.email = registerCandidateInput.email;
      createUserInput.password = registerCandidateInput.password;
      createUserInput.role = Role.CANDIDATE;

      await this.usersService.create(createUserInput);

      this.logger.log('Candidate successfully registered!');
    } catch (err) {
      if (err.code === PostgresErrorCode.UniqueViolation) {
        this.logger.error('E-mail já cadastrado!');
        throw new ConflictException('E-mail já cadastrado!');
      }

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    return;
  }
}
