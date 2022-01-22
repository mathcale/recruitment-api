import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateJobInput } from './dto/create-job.input';
import { JobsService } from './jobs.service';
import { Role } from '../users/enums/role.enum';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateJobInput } from './dto/update-job.input';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  create(@Body() createJobDto: CreateJobInput) {
    return this.jobsService.create(createJobDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.RECRUITER)
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobInput) {
    return this.jobsService.update(+id, updateJobDto);
  }
}
