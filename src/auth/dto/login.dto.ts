import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'The password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
