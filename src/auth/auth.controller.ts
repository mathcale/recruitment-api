import { Body, Controller, Logger, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterCandidateInput } from './dto/register-candidate.input';

@Controller('accounts')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/create-account')
  registerCandidate(@Body() registerCandidateInput: RegisterCandidateInput) {
    this.logger.log('Starting new candidate registration flow...');

    return this.authService.registerCandidate(registerCandidateInput);
  }
}
