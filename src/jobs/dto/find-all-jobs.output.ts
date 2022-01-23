import { Job } from '../entities/job.entity';

export class FindAllJobsOutput {
  count: number;
  pageSize: number;
  data: Job[];
}
