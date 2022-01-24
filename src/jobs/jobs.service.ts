import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Like } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const escape = require('lodash.escape');

import { ApplyToJobInput } from './dto/apply-to-job.input';
import { CreateJobInput } from './dto/create-job.input';
import { FindAllJobsOutput } from './dto/find-all-jobs.output';
import { FindAllJobsParams } from './dto/find-all-jobs.params';
import { Job } from './entities/job.entity';
import { JobPublicationStatus } from './enums/job-publication-status.enum';
import { JobsRepository } from './jobs.repository';
import { PostgresErrorCode } from '../users/users.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(JobsRepository) private readonly jobsRepository: JobsRepository,
    private readonly usersService: UsersService,
  ) {}

  async findAll({ page, pageSize, name }: FindAllJobsParams): Promise<FindAllJobsOutput> {
    this.logger.log(
      `Starting find all jobs flow, page: [${page}], pageSize: [${pageSize}], name: [${name}]`,
    );

    const where: FindConditions<Job> = {};

    if (name) {
      where.name = Like(`%${escape(name)}%`);
    }

    const [result, total] = await this.jobsRepository.findAndCount({
      take: pageSize,
      skip: (page - 1) * pageSize,
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    this.logger.log(`Fetched jobs, found [${total}]`);

    return {
      count: total,
      pageSize,
      data: result,
    };
  }

  async findOne(externalId: string, withApplications: boolean = false): Promise<Job | never> {
    this.logger.log(`Fetching job [${externalId}]...`);

    const foundJob = await this.jobsRepository.findOne(
      { externalId },
      withApplications && { relations: ['users'] },
    );

    if (!foundJob) {
      this.logger.warn(`Job [${externalId}] not found!`);

      throw new NotFoundException();
    }

    this.logger.log(`Found job, returning it...`);

    return foundJob;
  }

  async create(createJobInput: CreateJobInput): Promise<Job | never> {
    try {
      const newJob = this.jobsRepository.create(createJobInput);
      newJob.name = escape(newJob.name);

      this.logger.log('Saving new job...');

      const job = await this.jobsRepository.save(newJob);

      this.logger.log('Job successfully saved!');

      return job;
    } catch (err) {
      if (err.code === PostgresErrorCode.UniqueViolation) {
        this.logger.error('Vaga já cadastrada!');
        throw new ConflictException('Vaga já cadastrada!');
      }

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async publishJob(externalId: string): Promise<Job | never> {
    const job = await this.findOne(externalId);

    if (job.status === JobPublicationStatus.PUBLISHED) {
      throw new ConflictException('Vaga já publicada!');
    }

    this.logger.log(`Publishing job [${externalId}]...`);

    job.status = JobPublicationStatus.PUBLISHED;
    const updatedJob = await this.jobsRepository.save(job);

    this.logger.log('Job successfully published!');

    return updatedJob;
  }

  async applyToJob(jobExternalId: string, applyToJobInput: ApplyToJobInput): Promise<void | never> {
    const job = await this.findOne(jobExternalId, true);

    if (job.status !== JobPublicationStatus.PUBLISHED) {
      throw new ConflictException(
        'A vaga precisa estar publicada para aceitar aplicações de candidatos',
      );
    }

    // FIXME: use query builder to check if user already applied to this job
    if (job.users.find((applicant) => applicant.externalId === applyToJobInput.userExternalId)) {
      this.logger.error(
        `Candidade [${applyToJobInput.userExternalId}] already applied to job [${jobExternalId}]`,
      );

      throw new ConflictException('Candidato já cadastrado na vaga');
    }

    const user = await this.usersService.findByExternalId(applyToJobInput.userExternalId);
    job.users.push(user);

    this.logger.log('Saving relation between Job and User...');

    await this.jobsRepository.save(job);

    this.logger.log('Relation successfully saved!');
  }
}
