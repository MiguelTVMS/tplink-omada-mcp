import { loadConfigFromEnv } from './config.js';
import { OmadaClient } from './omadaClient.js';
import { startServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfigFromEnv();
  const client = new OmadaClient(config);
  await startServer(client);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to start Omada MCP server: ${message}`);
  process.exitCode = 1;
});
