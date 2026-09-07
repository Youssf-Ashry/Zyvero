import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Zyvero backend foundation is running.');
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({
      status: 'ok',
      service: 'zyvero-backend',
      environment: 'test',
    });
  });

  it('POST /api/contact creates a contact inquiry', () => {
    return request(app.getHttpServer())
      .post('/api/contact')
      .send({
        name: 'Task 2 Test',
        email: 'task2@example.com',
        subject: 'Contact flow test',
        message: 'This verifies the contact inquiry flow.',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          name: 'Task 2 Test',
          email: 'task2@example.com',
          subject: 'Contact flow test',
          message: 'This verifies the contact inquiry flow.',
        });
        expect(body.id).toEqual(expect.any(String));
        expect(body.createdAt).toEqual(expect.any(String));
      });
  });

  it('POST /api/contact rejects invalid input', () => {
    return request(app.getHttpServer())
      .post('/api/contact')
      .send({
        name: ' ',
        email: 'invalid-email',
        subject: '',
        message: ' ',
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
