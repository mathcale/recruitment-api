import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterCandidateInput {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'campo "password" deve possuir pelo menos 1 letra maiúscula, 1 letra minúscula e 1 número ou caracter especial',
  })
  password: string;
}
