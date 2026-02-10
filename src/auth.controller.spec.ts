import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './security/auth.controller';
import { AuthService } from './security/auth.service';


describe('AuthController smoke', () => {
  let app: INestApplication;
  const authService = {
    login: jest.fn(),
    findUserByEmail: jest.fn(),
    generateOtp: jest.fn(),
    sendOtpEmail: jest.fn(),
    validateOtp: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login returns 200 and expected shape', async () => {
    authService.login.mockResolvedValueOnce({
      user: { username: 'admin', email: 'admin@example.com' },
      token: 'test-token',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'secret' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      username: 'admin',
      email: 'admin@example.com',
      token: 'test-token',
    });
  });

  it('POST /api/v1/auth/logout returns 200 and message shape', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Logout successful. Please discard the JWT token on the client side.',
    });
  });
});
