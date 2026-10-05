import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}