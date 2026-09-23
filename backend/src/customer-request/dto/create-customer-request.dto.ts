import { IsString, IsUUID, Length } from 'class-validator';

export class CreateCustomerRequestDto {
  @IsUUID()
  serviceId!: string;

  @IsString()
  @Length(1, 150)
  title!: string;

  @IsString()
  @Length(1, 10000)
  description!: string;
}
