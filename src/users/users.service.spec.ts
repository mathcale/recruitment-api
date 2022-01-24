import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';

import { CreateUserInput } from './dto/create-user.input';
import { Role } from './enums/role.enum';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const candidateMock: User = Builder(User)
    .id(1)
    .externalId('mock-candidate')
    .name('Mock Candidate 1')
    .email('candidate@mock.com')
    .role(Role.CANDIDATE)
    .build();

  const createUserInput: CreateUserInput = Builder(CreateUserInput)
    .name('Mock Candidate 1')
    .email('candidate@mock.com')
    .password('Mock123!')
    .role(Role.CANDIDATE)
    .build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        {
          provide: getRepositoryToken(UsersRepository),
          useValue: {
            findOne: jest.fn().mockResolvedValue(candidateMock),
            createUser: jest.fn().mockResolvedValue(candidateMock),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('candidate@mock.com');

    expect(user).toBeDefined();
    expect(user).toStrictEqual(candidateMock);
  });

  it('should throw "not found" error when user with email doesn\'t exists', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.findByEmail('ghost@mock.com')).rejects.toThrowError(NotFoundException);
  });

  it('should find user by externalId', async () => {
    const user = await service.findByExternalId('mock-candidate');

    expect(user).toBeDefined();
    expect(user).toStrictEqual(candidateMock);
  });

  it('should throw "not found" error when user with externalId doesn\'t exists', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.findByExternalId('ghost')).rejects.toThrowError(NotFoundException);
  });

  it('should create new user of type Candidate successfully', async () => {
    const newUser = await service.create(createUserInput);

    expect(newUser).toBeDefined();
    expect(newUser).toStrictEqual(candidateMock);
  });

  it('show throw error while creating user with bad input', async () => {
    jest.spyOn(repository, 'createUser').mockRejectedValue(new Error());

    await expect(service.create({} as CreateUserInput)).rejects.toThrow();
  });
});
