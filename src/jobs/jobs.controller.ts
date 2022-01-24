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
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ApplyToJobInput } from './dto/apply-to-job.input';
import { CreateJobInput } from './dto/create-job.input';
import { FindAllJobsParams } from './dto/find-all-jobs.params';
import { JobsService } from './jobs.service';
import { Role } from '../users/enums/role.enum';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller({ path: 'jobs', version: '1' })
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('list-all-jobs')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  findAll(@Query() findAllJobsParams: FindAllJobsParams) {
    return this.jobsService.findAll(findAllJobsParams);
  }

  @Get(':externalId')
  findOne(@Param('externalId') externalId: string) {
    return this.jobsService.findOne(externalId);
  }

  @Get('view-applications/:externalId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.INTERVIEWER)
  findApplications(
    @Param('externalId') externalId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.jobsService.findApplications(externalId, page, pageSize);
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

  @Post('apply/:externalId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CANDIDATE)
  applyToJob(@Param('externalId') jobExternalId: string, @Body() applyToJobInput: ApplyToJobInput) {
    return this.jobsService.applyToJob(jobExternalId, applyToJobInput);
  }
}
