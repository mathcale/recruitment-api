import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const escape = require('lodash.escape');

import { CreateJobInput } from './dto/create-job.input';
import { Job } from './entities/job.entity';
import { JobsRepository } from './jobs.repository';
import { PostgresErrorCode } from '../users/users.repository';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectRepository(Job) private readonly jobsRepository: JobsRepository) {}

  findAll() {
    return `This action returns all jobs`;
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
