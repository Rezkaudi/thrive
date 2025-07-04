export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
  generateTemporaryPassword(): string;
  validatePasswordStrength(password: string): boolean;
}