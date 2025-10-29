import { z } from 'zod';

const envSchema = z.object({
  baseUrl: z.string().url({ message: 'OMADA_BASE_URL must be a valid URL' }),
  username: z.string().min(1, 'OMADA_USERNAME is required'),
  password: z.string().min(1, 'OMADA_PASSWORD is required'),
  siteId: z.string().min(1).optional(),
  strictSsl: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => value !== 'false'),
  requestTimeout: z
    .string()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
    .pipe(z.number().positive().optional()),
  proxyUrl: z.string().url().optional()
});

export interface EnvironmentConfig {
  baseUrl: string;
  username: string;
  password: string;
  siteId?: string;
  strictSsl: boolean;
  requestTimeout?: number;
  proxyUrl?: string;
}

export function loadConfigFromEnv(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  const parsed = envSchema.safeParse({
    baseUrl: env.OMADA_BASE_URL,
    username: env.OMADA_USERNAME,
    password: env.OMADA_PASSWORD,
    siteId: env.OMADA_SITE_ID,
    strictSsl: env.OMADA_STRICT_SSL,
    requestTimeout: env.OMADA_TIMEOUT,
    proxyUrl: env.OMADA_PROXY_URL
  });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message);
    throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`);
  }

  return {
    baseUrl: parsed.data.baseUrl.replace(/\/$/, ''),
    username: parsed.data.username,
    password: parsed.data.password,
    siteId: parsed.data.siteId,
    strictSsl: parsed.data.strictSsl ?? true,
    requestTimeout: parsed.data.requestTimeout,
    proxyUrl: parsed.data.proxyUrl
  };
}
