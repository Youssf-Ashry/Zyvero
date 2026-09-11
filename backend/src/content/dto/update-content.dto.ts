import { IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { ProjectContentType } from '@prisma/client';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  @Length(1, 250)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50000)
  content?: string;

  @IsOptional()
  @IsEnum(ProjectContentType)
  type?: ProjectContentType;

  @IsOptional()
  @IsUrl()
  url?: string;
}
