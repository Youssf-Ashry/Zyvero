import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the app bootstrap message', () => {
      expect(appController.getHello()).toBe('Zyvero backend foundation is running.');
    });
  });

  describe('health', () => {
    it('should return the application health payload', () => {
      expect(appController.getHealth()).toMatchObject({
        status: 'ok',
        service: 'zyvero-backend',
      });
    });
  });
});
