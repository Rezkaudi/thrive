import { AuthenticationError } from '../../../domain/errors/AuthenticationError';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../services/IEmailService';
import { ITokenService } from '../../services/ITokenService';

export interface RequestPasswordResetDTO {
  email: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private tokenService: ITokenService
  ) { }

  async execute(dto: RequestPasswordResetDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Don't reveal if user exists or not for security
    if (!user || !user.isverify) {
      throw new AuthenticationError('User not Found or not Verified', 400);
    }

    // Generate reset token
    const resetToken = this.tokenService.generatePasswordResetToken(user.id, user.email);


    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }
}