import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole } from '../users/user.schema';
import { UserRolesService } from '../user-roles/user-roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private userRolesService: UserRolesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user roles and permissions
    const userRoles = await this.userRolesService.findByUser(user._id.toString());
    const roleNames = userRoles.map((ur: any) => ur.roleId?.name).filter(Boolean);

    const payload = { 
      email: user.email, 
      sub: user._id.toString(), 
      role: user.role,
      roles: roleNames,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: roleNames,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user: any = await this.usersService.create({
      ...registerDto,
      role: UserRole.USER,
    });

    // Get user roles (will be empty for new user)
    const userRoles = await this.userRolesService.findByUser(user._id.toString());
    const roleNames = userRoles.map((ur: any) => ur.roleId?.name).filter(Boolean);

    const payload = { 
      email: user.email, 
      sub: user._id.toString(), 
      role: user.role,
      roles: roleNames,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: roleNames,
      },
    };
  }
}
