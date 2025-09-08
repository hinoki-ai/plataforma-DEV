import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

  // Cloudinary (optional in production for core functionality)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Optional environment variables
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_URL: z.string().url('APP_URL must be a valid URL').optional(),

  // Email (optional)
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_SERVER_USER: z.string().email().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = (error as any).issues
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.\n` +
          `You can copy .env.example to .env.local and fill in the values.`
      );
    }
    throw error;
  }
}

// Validate environment variables at module load time
export const env = validateEnv();

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';

// Helper function to get the app URL
export const getAppUrl = () => {
  if (env.APP_URL) return env.APP_URL;
  if (env.NEXTAUTH_URL) return env.NEXTAUTH_URL;
  return isDevelopment ? 'http://localhost:3000' : 'https://your-domain.com';
};

export default env;
