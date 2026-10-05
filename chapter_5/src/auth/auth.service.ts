import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import bcrypt from 'bcryptjs';
import { usersTable } from '../database/schema/users.schema.js';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import { DatabaseError } from 'pg';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

const UNIQUE_VIOLATION_ERROR_CODE = '23505';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private async createJwt({id, email}: {id: string; email: string}) {
    return this.jwtService.signAsync({id, email});
  }

  async register(userDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    try {
      const [user] = await this.databaseService.db
        .insert(usersTable)
        .values({
          email: userDto.email,
          password: hashedPassword,
        })
        .returning({
          id: usersTable.id,
        });

      const payload = {
        email: userDto.email,
        id: user.id,
      };

      const jwt = await this.createJwt(payload)

      return {
        token: jwt,
      };
    } catch (error: unknown) {
      if (
        error instanceof DrizzleQueryError &&
        error.cause instanceof DatabaseError &&
        error.cause.code === UNIQUE_VIOLATION_ERROR_CODE
      ) {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async login(userDto: CreateUserDto) {
    const [user] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userDto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      email: userDto.email,
      id: user.id,
    };

    const token = await this.createJwt(payload)

    return {
      token,
    };
  }
}
