import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsString()
  @Length(1, 120)
  slug!: string;

  @IsString()
  @Length(1, 300)
  shortDescription!: string;

  @IsString()
  @Length(1, 10000)
  description!: string;

  @IsString()
  @Length(1, 80)
  icon!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
