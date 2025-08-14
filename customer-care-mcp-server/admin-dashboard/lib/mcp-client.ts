import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

let mcpClient: Client | null = null;

export async function getMCPClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  // Path to the MCP server
  const serverPath = process.env.MCP_SERVER_PATH || '../src/index.ts';
  
  // Spawn the MCP server process
  const serverProcess = spawn('npx', ['tsx', serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.env.MCP_SERVER_CWD || process.cwd() + '/..',
  });

  // Create transport using the server process
  const transport = new StdioClientTransport({
    stdin: serverProcess.stdin,
    stdout: serverProcess.stdout,
    stderr: serverProcess.stderr,
  });

  // Create and initialize the client
  mcpClient = new Client(
    {
      name: 'admin-dashboard',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(transport);

  // Handle process cleanup
  process.on('exit', () => {
    serverProcess.kill();
  });

  return mcpClient;
}

export async function callMCPTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const client = await getMCPClient();
  
  const result = await client.callTool({
    name,
    arguments: args,
  });

  if (result.isError) {
    throw new Error(`MCP tool error: ${result.content[0]?.text || 'Unknown error'}`);
  }

  // Parse JSON response if it's text content
  const content = result.content[0];
  if (content?.type === 'text') {
    try {
      return JSON.parse(content.text);
    } catch {
      return content.text;
    }
  }

  return result.content[0];
}