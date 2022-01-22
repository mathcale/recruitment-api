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
import { Builder } from 'builder-pattern';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const escape = require('lodash.escape');

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

    const payload = Builder(JwtPayload)
      .sub(user.externalId)
      .name(user.name)
      .email(user.email)
      .role(user.role)
      .build();

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

      const createUserInput = Builder(CreateUserInput)
        .name(escape(registerCandidateInput.name))
        .email(escape(registerCandidateInput.email))
        .password(registerCandidateInput.password)
        .role(Role.CANDIDATE)
        .build();

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
