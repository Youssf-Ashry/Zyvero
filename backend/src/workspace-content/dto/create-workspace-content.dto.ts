import { IsEnum, IsString, Length } from 'class-validator';
import { ProjectContentType } from '@prisma/client';

export class CreateWorkspaceContentDto {
  @IsString()
  @Length(1, 250)
  title!: string;

  @IsString()
  @Length(1, 50000)
  content!: string;

  @IsEnum(ProjectContentType)
  type!: ProjectContentType;
}
