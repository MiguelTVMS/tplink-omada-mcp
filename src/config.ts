import { z } from 'zod';

const booleanStringSchema = z
  .union([z.literal('true'), z.literal('false')])
  .optional()
  .transform((value) => value !== 'false');

const numericStringSchema = z
  .string()
  .optional()
  .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
  .pipe(z.number().positive().optional());

const envSchema = z.object({
  baseUrl: z.string().url({ message: 'OMADA_BASE_URL must be a valid URL' }),
  clientId: z.string().min(1, 'OMADA_CLIENT_ID is required'),
  clientSecret: z.string().min(1, 'OMADA_CLIENT_SECRET is required'),
  omadacId: z.string().min(1, 'OMADA_OMADAC_ID is required'),
  siteId: z.string().min(1).optional(),
  strictSsl: booleanStringSchema,
  requestTimeout: numericStringSchema,
  proxyUrl: z.string().url().optional()
});

export interface EnvironmentConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  omadacId: string;
  siteId?: string;
  strictSsl: boolean;
  requestTimeout?: number;
  proxyUrl?: string;
}

export function loadConfigFromEnv(env: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  const parsed = envSchema.safeParse({
    baseUrl: env.OMADA_BASE_URL,
    clientId: env.OMADA_CLIENT_ID,
    clientSecret: env.OMADA_CLIENT_SECRET,
    omadacId: env.OMADA_OMADAC_ID ?? env.OMADA_CONTROLLER_ID,
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
    clientId: parsed.data.clientId,
    clientSecret: parsed.data.clientSecret,
    omadacId: parsed.data.omadacId,
    siteId: parsed.data.siteId,
    strictSsl: parsed.data.strictSsl ?? true,
    requestTimeout: parsed.data.requestTimeout,
    proxyUrl: parsed.data.proxyUrl
  };
}
