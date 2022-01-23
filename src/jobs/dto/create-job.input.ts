import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobInput {
  @IsNotEmpty()
  @IsString()
  name: string;
}
