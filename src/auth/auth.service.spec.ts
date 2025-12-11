import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-jwt'),
  };

  const userDoc = {
    _id: 'user-id',
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User',
    role: 'user',
    toObject() {
      return {
        _id: this._id,
        email: this.email,
        password: this.password,
        name: this.name,
        role: this.role,
      };
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('returns user without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(userDoc);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toMatchObject({ email: userDoc.email, password: undefined });
    });

    it('returns null when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      const result = await service.validateUser('test@example.com', 'bad');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns access token and user info', async () => {
      const result = await service.login(userDoc as any);
      expect(result.access_token).toBe('signed-jwt');
      expect(result.user.email).toBe(userDoc.email);
    });
  });

  describe('register', () => {
    it('hashes password and creates user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-pass' as any);
      usersService.create.mockResolvedValue(userDoc);

      const created = await service.register({
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(created.password).toBeUndefined();
    });
  });
});

