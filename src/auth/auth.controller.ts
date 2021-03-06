import { Body, Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterCandidateInput } from './dto/register-candidate.input';
import { SignInInput } from './dto/sign-in.input';
import { User } from '../users/entities/user.entity';

@Controller({ path: 'accounts', version: '1' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Post('/create-account')
  registerCandidate(@Body() registerCandidateInput: RegisterCandidateInput) {
    this.logger.log('Starting new candidate registration flow...');

    return this.authService.registerCandidate(registerCandidateInput);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getCurrentUser(@Req() req: any): Promise<User> {
    return req.user;
  }
}
