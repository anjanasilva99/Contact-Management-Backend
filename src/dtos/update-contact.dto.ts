import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { IsPhoneNumber } from '../phone-number.decorator';

export class UpdateContactDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @IsOptional()
  @IsPhoneNumber({ message: 'Phone number is invalid' })
  phone: string;
}
