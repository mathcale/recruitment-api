import { Exclude } from 'class-transformer';
import { Role } from '../../users/enums/role.enum';

export class JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;

  @Exclude()
  exp: number;

  @Exclude()
  iat: number;
}
