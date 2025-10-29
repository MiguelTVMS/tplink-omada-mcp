import { loadConfigFromEnv } from './config.js';
import { OmadaClient } from './omadaClient.js';
import { startServer } from './server.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  logger.info('Starting stdio server');
  const config = loadConfigFromEnv();
  const client = new OmadaClient(config);
  await startServer(client);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error('Failed to start Omada MCP server', { error: message });
  process.exitCode = 1;
});
