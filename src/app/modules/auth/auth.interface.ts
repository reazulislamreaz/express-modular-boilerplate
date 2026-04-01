export type TAccount = {
  email: string;
  password: string;
  isDeleted?: boolean;
  accountStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role?: "USER" | "ADMIN";
  isVerified?: boolean;
  
  // Email verification
  verificationCode?: string;
  verificationCodeExpires?: Date;
  
  // Password reset
  resetPasswordCode?: string;
  resetPasswordExpire?: Date;
  
  // Two-factor authentication
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  
  // Security
  lastPasswordChange?: Date;
  loginAttempts?: number;
  lockedUntil?: Date;
};

export interface TRegisterPayload extends TAccount {
  name: string;
  number?: string;
}

export type TLoginPayload = {
  email: string;
  password: string;
  twoFactorCode?: string;
};

export type TJwtUser = {
  email: string;
  role?: "ADMIN" | "USER";
};

export type TTwoFASetup = {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
};
