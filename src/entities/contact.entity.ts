import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Column()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;
}
