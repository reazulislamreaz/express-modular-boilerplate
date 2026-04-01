import { z } from "zod";
import { SECURITY_CONFIG } from "../../constants/auth";

// Password strength validation regex patterns
const passwordStrengthRegex = {
    minLength: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
};

// Password requirements message
const PASSWORD_REQUIREMENTS = 'at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';

// Password validation helper
const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (!passwordStrengthRegex.minLength.test(password)) {
        errors.push('at least 8 characters');
    }
    if (!passwordStrengthRegex.uppercase.test(password)) {
        errors.push('one uppercase letter');
    }
    if (!passwordStrengthRegex.lowercase.test(password)) {
        errors.push('one lowercase letter');
    }
    if (!passwordStrengthRegex.number.test(password)) {
        errors.push('one number');
    }
    if (!passwordStrengthRegex.special.test(password)) {
        errors.push('one special character');
    }
    return errors;
};

// Zod schema matching TAccount / authSchema
const register_validation = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }).refine(
        (val) => validatePassword(val).length === 0,
        {
            message: `Password must contain ${PASSWORD_REQUIREMENTS}`,
        }
    ),
    name: z.string({ message: "Name is required" }).min(2, "Name must be at least 2 characters"),
    number: z.string().optional(),
});

const login_validation = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }),
    twoFactorCode: z.string().regex(/^\d{6}$/, "Two-factor code must be 6 digits").optional(),
});

const changePassword = z.object({
    oldPassword: z.string({ message: "Old password is required" }),
    newPassword: z.string({ message: "New password is required" }).refine(
        (val) => validatePassword(val).length === 0,
        {
            message: `Password must contain ${PASSWORD_REQUIREMENTS}`,
        }
    ),
});

const forgotPassword = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
});

const resetPassword = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    verificationCode: z.string({ message: "Verification code is required" }).regex(/^\d{6}$/, "Verification code must be 6 digits"),
    newPassword: z.string({ message: "New password is required" }).refine(
        (val) => validatePassword(val).length === 0,
        {
            message: `Password must contain ${PASSWORD_REQUIREMENTS}`,
        }
    ),
    confirmPassword: z.string({ message: "Confirm password is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const verifyEmail = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    verificationCode: z.string({ message: "Verification code is required" }).regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

const verifyTwoFactor = z.object({
    twoFactorCode: z.string({ message: "Two-factor code is required" }).regex(/^\d{6}$/, "Two-factor code must be 6 digits"),
});

const enableTwoFactor = z.object({
    password: z.string({ message: "Password is required" }),
});

const disableTwoFactor = z.object({
    twoFactorCode: z.string({ message: "Two-factor code is required" }).regex(/^\d{6}$/, "Two-factor code must be 6 digits"),
});

const useBackupCode = z.object({
    backupCode: z.string({ message: "Backup code is required" }).min(1, "Backup code is required"),
});

export const authValidations = {
    register_validation,
    login_validation,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    verifyTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    useBackupCode,
};
