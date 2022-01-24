import { EntityRepository, Repository } from 'typeorm';

import { Job } from './entities/job.entity';

@EntityRepository(Job)
export class JobsRepository extends Repository<Job> {}
