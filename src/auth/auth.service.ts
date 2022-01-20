import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

import { CreateUserInput } from '../users/dto/create-user.input';
import { JwtPayload } from './dto/jwt-payload.output';
import { PostgresErrorCode } from '../users/users.repository';
import { RegisterCandidateInput } from './dto/register-candidate.input';
import { Role } from '../users/enums/role.enum';
import { SignInInput } from './dto/sign-in.input';
import { SignInOutput } from './dto/sign-in.output';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInInput: SignInInput): Promise<SignInOutput | never> {
    this.logger.log('Validating user credentials...');

    const user = await this.usersService.findByEmail(signInInput.email);
    const passwordMatches = bcrypt.compareSync(signInInput.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Senha incorreta');
    }

    this.logger.log('Credentials successfully validated! Creating token...');

    // FIXME: convert to mapper
    const payload = new JwtPayload();
    payload.sub = user.externalId;
    payload.name = user.name;
    payload.email = user.email;
    payload.role = user.role;

    const token = this.jwtService.sign(instanceToPlain(payload));

    return {
      token,
    };
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

  async validateUser(payload: JwtPayload): Promise<User | never> {
    this.logger.debug('Validating current user...');

    return this.usersService.findByEmail(payload.email).catch(() => {
      this.logger.error(`Invalid user detected! Token payload:`, payload);

      throw new UnauthorizedException();
    });
  }
}
