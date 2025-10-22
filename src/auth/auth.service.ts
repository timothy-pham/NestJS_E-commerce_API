import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto, GuestTokenResponseDto } from './dto/auth.dto';
import { UserRolesService } from '../user-roles/user-roles.service';
import { RolesService } from '../roles/roles.service';
import { UserType } from '../users/user.schema';
import { PermissionScope } from '../permissions/permission.schema';

interface JwtPayload {
  email?: string;
  sub: string;
  userType: string;
  roles: string[];
  isGuest?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRolesService: UserRolesService,
    private rolesService: RolesService,
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

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      userType: user.userType,
      roles: roleNames,
      isGuest: false,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        roles: roleNames,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user: any = await this.usersService.create({
      ...registerDto,
      userType: UserType.CUSTOMER,
    });

    // Assign default customer role if it exists
    try {
      const customerRole = await this.rolesService.findByName('customer');
      if (customerRole) {
        await this.userRolesService.assignRole({
          userId: user._id.toString(),
          roleId: (customerRole as any)._id.toString(),
          scope: PermissionScope.SYSTEM,
        });
      }
    } catch (error) {
      // Customer role doesn't exist yet, skip assignment
      console.log('Customer role not found, skipping role assignment');
    }

    // Get user roles after assignment
    const userRoles = await this.userRolesService.findByUser(user._id.toString());
    const roleNames = userRoles.map((ur: any) => ur.roleId?.name).filter(Boolean);

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id.toString(),
      userType: user.userType,
      roles: roleNames,
      isGuest: false,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        roles: roleNames,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Get fresh user data and roles
      const user = await this.usersService.findOne(payload.sub);
      const userRoles = await this.userRolesService.findByUser(payload.sub);
      const roleNames = userRoles.map((ur: any) => ur.roleId?.name).filter(Boolean);

      const newPayload: JwtPayload = {
        email: payload.email,
        sub: payload.sub,
        userType: payload.userType,
        roles: roleNames,
        isGuest: false,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async createGuestToken(): Promise<GuestTokenResponseDto> {
    const guestSessionId = crypto.randomUUID();

    const payload: JwtPayload = {
      sub: `guest_${guestSessionId}`,
      userType: 'guest',
      roles: ['guest'],
      isGuest: true,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Guest tokens expire in 1 hour
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      guest_session_id: guestSessionId,
    };
  }
}
