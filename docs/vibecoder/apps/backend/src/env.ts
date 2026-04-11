/**
 * Parse environment variables with defaults for MVP.
 * In production, use a proper library like zod or env-var.
 */
export function parseEnv(): {
  port: number;
  host: string;
  openaiApiKey: string | undefined;
  googleApiKey: string | undefined;
  gitAuthorName: string;
  gitAuthorEmail: string;
} {
  return {
    port: Number(process.env.PORT ?? 8787),
    host: process.env.HOST ?? "127.0.0.1",
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    gitAuthorName: process.env.GIT_AUTHOR_NAME ?? "VibeCoder",
    gitAuthorEmail: process.env.GIT_AUTHOR_EMAIL ?? "vibecoder@local.dev"
  };
}
