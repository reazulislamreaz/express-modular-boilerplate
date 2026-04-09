import "dotenv/config";

// Validate required environment variables
const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'DB_URL',
    'ACCESS_TOKEN',
    'REFRESH_TOKEN',
    'ACCESS_EXPIRES',
    'REFRESH_EXPIRES',
    'RESET_SECRET',
    'RESET_EXPIRES',
    'FRONT_END_URL',
    'VERIFIED_TOKEN',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
const isProduction = process.env.NODE_ENV === "production";

if (missingEnvVars.length > 0) {
    const message = `Missing required environment variables: ${missingEnvVars.join(", ")}`;
    if (isProduction) {
        throw new Error(message);
    } else {
        console.warn(`⚠️ ${message}`);
    }
}

// Validate JWT secret strength
const minSecretLength = 32;
const validateSecret = (secret: string | undefined, name: string) => {
    if (secret && secret.length < minSecretLength) {
        const message =
            `${name} must be at least ${minSecretLength} characters long. ` +
            `Current length: ${secret?.length || 0}. ` +
            `Use a strong random string (e.g., openssl rand -hex 32)`;

        if (isProduction) {
            throw new Error(message);
        } else {
            console.warn(`⚠️ ${message}`);
        }
    }
};

validateSecret(process.env.ACCESS_TOKEN, 'ACCESS_TOKEN');
validateSecret(process.env.REFRESH_TOKEN, 'REFRESH_TOKEN');
validateSecret(process.env.RESET_SECRET, 'RESET_SECRET');
validateSecret(process.env.VERIFIED_TOKEN, 'VERIFIED_TOKEN');

export const configs = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    jwt: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
        access_expires: process.env.ACCESS_EXPIRES,
        refresh_expires: process.env.REFRESH_EXPIRES,
        reset_secret: process.env.RESET_SECRET,
        reset_expires: process.env.RESET_EXPIRES,
        front_end_url: process.env.FRONT_END_URL,
        verified_token: process.env.VERIFIED_TOKEN
    },
    db_url: process.env.DB_URL,
    aws: {
        region: process.env.AWS_REGION,
        access_key_id: process.env.AWS_ACCESS_KEY_ID,
        secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
        bucket_name: process.env.AWS_BUCKET_NAME,
    },
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
    },
    email: {
        app_email: process.env.APP_USER_EMAIL,
        app_password: process.env.APP_PASSWORD
    },
    ip: {
        backend_ip: process.env.BACKEND_IP,
    },
    seed: {
        admin_email: process.env.ADMIN_EMAIL,
        admin_password: process.env.ADMIN_PASSWORD,
    },
    allowed_origins: process.env.ALLOWED_ORIGINS
};
