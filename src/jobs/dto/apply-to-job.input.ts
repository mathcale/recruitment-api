import { IsNotEmpty, IsUUID } from 'class-validator';

export class ApplyToJobInput {
  @IsNotEmpty()
  @IsUUID()
  userExternalId: string;
}
