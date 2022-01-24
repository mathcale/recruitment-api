import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';

import { ApplyToJobInput } from './dto/apply-to-job.input';
import { CreateJobInput } from './dto/create-job.input';
import { FindAllJobsParams } from './dto/find-all-jobs.params';
import { Job } from './entities/job.entity';
import { JobPublicationStatus } from './enums/job-publication-status.enum';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { PostgresErrorCode, UsersRepository } from '../users/users.repository';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

describe('JobsService', () => {
  let service: JobsService;
  let repository: JobsRepository;
  let usersService: UsersService;

  const publishedJobMock = Builder(Job)
    .id(1)
    .externalId('job-mock')
    .name('Job Mock')
    .status(JobPublicationStatus.PUBLISHED)
    .users([])
    .build();

  const unpublishedJobMock = Builder(Job)
    .id(1)
    .externalId('job-mock')
    .name('Job Mock')
    .status(JobPublicationStatus.UNPUBLISHED)
    .users([])
    .build();

  const candidateMock: User = Builder(User)
    .id(1)
    .externalId('mock-candidate')
    .name('Mock Candidate 1')
    .email('candidate@mock.com')
    .role(Role.CANDIDATE)
    .build();

  const publishedJobWithApplicationsMock = Builder(Job)
    .id(2)
    .externalId('job-with-applications-mock')
    .name('Job Mock with Applications')
    .status(JobPublicationStatus.PUBLISHED)
    .users([candidateMock])
    .build();

  const applyToJobInput: ApplyToJobInput = Builder(ApplyToJobInput)
    .userExternalId(candidateMock.externalId)
    .build();

  const createJobInput: CreateJobInput = Builder(CreateJobInput).name('Testing Wizard').build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        JobsRepository,
        UsersService,
        UsersRepository,
        {
          provide: getRepositoryToken(JobsRepository),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([[publishedJobMock], 1]),
            findOne: jest.fn().mockResolvedValue(publishedJobMock),
            create: jest.fn().mockReturnValue(unpublishedJobMock),
            save: jest.fn().mockResolvedValue(unpublishedJobMock),
          },
        },
        {
          provide: getRepositoryToken(UsersRepository),
          useValue: {
            findOne: jest.fn().mockResolvedValue(candidateMock),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get<JobsRepository>(JobsRepository);
    usersService = module.get<UsersService>(UsersService);
  });

  it('return list of found users', async () => {
    const findAllJobsParams: FindAllJobsParams = Builder(FindAllJobsParams)
      .page(1)
      .pageSize(10)
      .build();

    const result = await service.findAll(findAllJobsParams);

    expect(result).toBeDefined();
    expect(result.count).toEqual(1);
    expect(result.data).toStrictEqual([publishedJobMock]);
  });

  it('should find job by externalId', async () => {
    const job = await service.findOne('job-mock');

    expect(job).toBeDefined();
    expect(job).toStrictEqual(publishedJobMock);
  });

  it('should find job by externalId with applications', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(publishedJobWithApplicationsMock);
    const job = await service.findOne('job-with-applications-mock', true);

    expect(job).toBeDefined();
    expect(job).toStrictEqual(publishedJobWithApplicationsMock);
  });

  it('should create new job successfully', async () => {
    const newJob = await service.create(createJobInput);

    expect(newJob).toBeDefined();
    expect(newJob).toStrictEqual(unpublishedJobMock);
  });

  it('should throw error while trying to create already existing job', async () => {
    jest.spyOn(repository, 'save').mockRejectedValue({ code: PostgresErrorCode.UniqueViolation });

    await expect(service.create(createJobInput)).rejects.toThrowError(ConflictException);
  });

  it('should set job status to "published"', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(unpublishedJobMock);
    jest.spyOn(repository, 'save').mockResolvedValue(publishedJobMock);

    const updatedJob = await service.publishJob('job-mock');

    expect(updatedJob).toBeDefined();
    expect(updatedJob.status).toBe(JobPublicationStatus.PUBLISHED);
  });

  it('should throw error while trying to publish job with status "published"', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(publishedJobMock);

    await expect(service.publishJob('job-mock')).rejects.toThrowError(ConflictException);
  });

  it('should associate user to job', async () => {
    jest.spyOn(usersService, 'findByExternalId').mockResolvedValue(candidateMock);
    jest.spyOn(repository, 'findOne').mockResolvedValue(publishedJobMock);

    const saveMock = jest
      .spyOn(repository, 'save')
      .mockResolvedValue(publishedJobWithApplicationsMock);

    await service.applyToJob('job-mock', applyToJobInput);

    expect(saveMock).toBeCalledTimes(1);
  });

  it('should throw error while trying to associate user to unpublished job', async () => {
    jest.spyOn(usersService, 'findByExternalId').mockResolvedValue(candidateMock);
    jest.spyOn(repository, 'findOne').mockResolvedValue(unpublishedJobMock);

    await expect(service.applyToJob('job-mock', applyToJobInput)).rejects.toThrowError(
      ConflictException,
    );
  });

  it('should throw error while trying to reassociate user to job', async () => {
    jest.spyOn(usersService, 'findByExternalId').mockResolvedValue(candidateMock);
    jest.spyOn(repository, 'findOne').mockResolvedValue(publishedJobWithApplicationsMock);

    await expect(
      service.applyToJob('job-with-applications-mock', applyToJobInput),
    ).rejects.toThrowError(ConflictException);
  });
});
