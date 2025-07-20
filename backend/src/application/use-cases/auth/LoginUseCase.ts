// backend/src/application/use-cases/auth/LoginUseCase.ts
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordService } from '../../services/IPasswordService';
import { ITokenService } from '../../services/ITokenService';
import { AuthenticationError } from '../../../domain/errors/AuthenticationError';

export interface LoginDTO {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  csrfToken: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
    private tokenService: ITokenService
  ) { }

  async execute(dto: LoginDTO): Promise<{ response: LoginResponse; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials', 400);
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials', 400);
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive', 403);
    }

    // Generate new token pair
    const tokenPair = this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // const refreshToken = new RefreshToken(
    //   `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    //   user.id,
    //   tokenPair.refreshToken,
    //   expiresAt,
    //   new Date(),
    //   new Date(),
    //   dto.ipAddress,
    //   dto.userAgent
    // );

    // Generate CSRF token
    const csrfToken = this.tokenService.generateCSRFToken();

    return {
      response: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        csrfToken
      },
      tokens: tokenPair
    };
  }
}