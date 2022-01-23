import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateJobInput } from './dto/create-job.input';
import { FindAllJobsParams } from './dto/find-all-jobs.params';
import { JobsService } from './jobs.service';
import { Role } from '../users/enums/role.enum';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  findAll(@Query() findAllJobsParams: FindAllJobsParams) {
    return this.jobsService.findAll(findAllJobsParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  create(@Body() createJobInput: CreateJobInput) {
    return this.jobsService.create(createJobInput);
  }

  @Patch('publish-job/:externalId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  publishJob(@Param('externalId') externalId: string) {
    return this.jobsService.publishJob(externalId);
  }
}
