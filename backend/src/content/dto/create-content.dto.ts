import { IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { ProjectContentType } from '@prisma/client';

export class CreateContentDto {
  @IsString()
  @Length(1, 250)
  title!: string;

  @IsString()
  @Length(1, 50000)
  content!: string;

  @IsOptional()
  @IsEnum(ProjectContentType)
  type?: ProjectContentType;

  @IsOptional()
  @IsUrl()
  url?: string;
}
