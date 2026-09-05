import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Zyvero backend foundation is running.';
  }

  getHealth(): { status: string; service: string; environment: string } {
    return {
      status: 'ok',
      service: 'zyvero-backend',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
