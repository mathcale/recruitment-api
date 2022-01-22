import { Repository } from 'typeorm';

import { Job } from './entities/job.entity';

export class JobsRepository extends Repository<Job> {}
