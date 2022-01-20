import { Body, Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.strategy';
import { RegisterCandidateInput } from './dto/register-candidate.input';
import { SignInInput } from './dto/sign-in.input';

@Controller('accounts')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  public async signIn(@Body() signInInput: SignInInput): Promise<any | never> {
    return await this.authService.signIn(signInInput);
  }

  @Post('/create-account')
  registerCandidate(@Body() registerCandidateInput: RegisterCandidateInput) {
    this.logger.log('Starting new candidate registration flow...');

    return this.authService.registerCandidate(registerCandidateInput);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  public async testAuth(@Req() req: any): Promise<JwtPayload> {
    return req.user;
  }
}
