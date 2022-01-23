import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Like } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const escape = require('lodash.escape');

import { CreateJobInput } from './dto/create-job.input';
import { FindAllJobsOutput } from './dto/find-all-jobs.output';
import { FindAllJobsParams } from './dto/find-all-jobs.params';
import { Job } from './entities/job.entity';
import { JobsRepository } from './jobs.repository';
import { PostgresErrorCode } from '../users/users.repository';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectRepository(Job) private readonly jobsRepository: JobsRepository) {}

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

  findOne(id: number) {
    return `This action returns a #${id} job`;
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
    return;
  }
}
