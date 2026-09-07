import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateContactDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Transform(trimValue)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  message!: string;
}
