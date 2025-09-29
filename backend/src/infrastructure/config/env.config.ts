import dotenv from 'dotenv';
dotenv.config();

export const ENV_CONFIG = {
    // Server Configuration
    PORT: parseInt(process.env.PORT!) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.API_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,

    // Database Configuration
    DATABASE_URL: process.env.DATABASE_URL,

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

    // Stripe Configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_ONE_TIME_PRICE_ID: process.env.STRIPE_ONE_TIME_PRICE_ID,
    STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID,
    STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID,
    STRIPE_MONTHLY_DISCOUNT_PRICE_ID: process.env.STRIPE_MONTHLY_DISCOUNT_PRICE_ID,
    STRIPE_YEARLY_DISCOUNT_PRICE_ID: process.env.STRIPE_YEARLY_DISCOUNT_PRICE_ID,
    STRIPE_MONTHLY_PRICE_ID_SPECIAL: process.env.STRIPE_MONTHLY_PRICE_ID_SPECIAL,
    STRIPE_FREE_DAYS: parseInt(process.env.STRIPE_FREE_DAYS!) || 14,
    STRIPE_DISCOUNT_LIMIT_USERS: parseInt(process.env.STRIPE_DISCOUNT_LIMIT_USERS!) || 100,

    // Email Configuration
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT!) || 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,

    // AWS Configuration
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

};