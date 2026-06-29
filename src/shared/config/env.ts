/**
 * Application configuration.
 *
 * Credentials are loaded from environment variables (EXPO_PUBLIC_*),
 * which are populated from the .env file at build time.
 *
 * In production (EAS Build), these are injected as secrets.
 * In development, they are read from the .env file in the project root.
 *
 * IMPORTANT: Never hardcode credentials directly in source code.
 * Always use environment variables.
 */

// Expo automatically loads EXPO_PUBLIC_* prefixed vars from .env files
// Reference: https://docs.expo.dev/guides/environment-variables/

export const ENV = {
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '',
  WEATHER_API_BASE_URL: process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL ?? 'https://api.openweathermap.org/data/2.5',
  USE_MOCK_AUTH: process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true',
} as const;
