import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserInput {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsIn(Object.values(Role))
  role: Role;
}
