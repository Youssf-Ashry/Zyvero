import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export enum RequestDateRange {
  ALL = 'ALL',
  TODAY = 'TODAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
}

export class AdminRequestQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ALL', ...Object.values(RequestStatus)])
  status?: RequestStatus | 'ALL';

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsIn(Object.values(RequestDateRange))
  dateRange?: RequestDateRange;
}
