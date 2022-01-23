import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { JwtPayload } from './dto/jwt-payload.output';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { PostgresErrorCode, UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { SignInInput } from './dto/sign-in.input';
import { RegisterCandidateInput } from './dto/register-candidate.input';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const candidateMock: User = Builder(User)
    .id(1)
    .externalId('mock-candidate')
    .name('Mock Candidate 1')
    .email('candidate@mock.com')
    .role(Role.CANDIDATE)
    .build();

  const tokenPayloadMock = Builder(JwtPayload)
    .sub(candidateMock.externalId)
    .name(candidateMock.name)
    .email(candidateMock.email)
    .role(candidateMock.role)
    .build();

  const signInInput = Builder(SignInInput).email('candidate@mock.com').password('Mock123!').build();

  const badSignInInput = Builder(SignInInput)
    .email('candidate@mock.com')
    .password('non-valid-password')
    .build();

  const registerCandidateInput = Builder(RegisterCandidateInput)
    .name('Mock Candidate 1')
    .email('candidate@mock.com')
    .password('Mock123!')
    .build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        UsersRepository,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('hora-do-maestro'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(candidateMock),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    usersService = await module.get<UsersService>(UsersService);
  });

  it('should find a valid user from decoded token', async () => {
    const findByEmailSpy = jest.spyOn(usersService, 'findByEmail').mockResolvedValue(candidateMock);
    const user = await authService.validateUser(tokenPayloadMock);

    expect(findByEmailSpy).toBeCalledTimes(1);
    expect(user).toStrictEqual(candidateMock);
  });

  it("should throw exception if decoded token doesn't contain a valid user", async () => {
    jest.spyOn(usersService, 'findByEmail').mockRejectedValue(new UnauthorizedException());

    await expect(authService.validateUser(tokenPayloadMock)).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('should sign user in successfully', async () => {
    const findByEmailSpy = jest.spyOn(usersService, 'findByEmail').mockResolvedValue(candidateMock);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const signInOutput = await authService.signIn(signInInput);

    expect(findByEmailSpy).toBeCalledTimes(1);
    expect(signInOutput).toBeDefined();
    expect(signInOutput.token.length).toBeGreaterThan(0);
  });

  it('should throw error if provided password is invalid', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(candidateMock);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.signIn(badSignInInput)).rejects.toThrowError(UnauthorizedException);
  });

  it('should register new candidate successfully', async () => {
    const createUserMock = jest
      .spyOn(usersService, 'create')
      .mockImplementation(() => Promise.resolve(candidateMock));

    await authService.registerCandidate(registerCandidateInput);

    expect(createUserMock).toBeCalledTimes(1);
  });

  it('should throw error while trying to register candidate with an already used email', async () => {
    jest
      .spyOn(usersService, 'create')
      .mockRejectedValue({ code: PostgresErrorCode.UniqueViolation });

    await expect(authService.registerCandidate(registerCandidateInput)).rejects.toThrowError(
      ConflictException,
    );
  });
});
