import { mcpClient } from 'genkitx-mcp';

export const microsoftDocsClient = mcpClient({
  name: 'microsoft-docs',
  serverProcess: {
    command: 'npx',
    args: ['mcp-remote', 'https://learn.microsoft.com/api/mcp']
  }
});

export const awsKnowledgeClient = mcpClient({
  name: 'aws-knowledge',
  serverProcess: {
    command: 'npx',
    args: ['mcp-remote', 'https://knowledge-mcp.global.api.aws']
  }
});

export const awsDocumentationClient = mcpClient({
  name: 'aws-documentation',
  serverProcess: {
    command: '/home/user/.local/bin/uvx',
    args: ['awslabs.aws-documentation-mcp-server@latest']
  }
});