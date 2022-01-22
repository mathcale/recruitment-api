import { Injectable } from '@nestjs/common';

import { CreateJobInput } from './dto/create-job.input';
import { UpdateJobInput } from './dto/update-job.input';

@Injectable()
export class JobsService {
  findAll() {
    return `This action returns all jobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  create(createJobDto: CreateJobInput) {
    return 'This action adds a new job';
  }

  update(id: number, updateJobDto: UpdateJobInput) {
    return `This action updates a #${id} job`;
  }
}
