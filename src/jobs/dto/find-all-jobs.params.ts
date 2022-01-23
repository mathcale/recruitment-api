import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllJobsParams {
  @IsInt()
  @Transform(({ value }) => +value)
  page: number = 1;

  @IsInt()
  @Transform(({ value }) => +value)
  pageSize: number = 10;

  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
