// Quick script to check available MCP tools
const { spawn } = require('child_process');

const mcp = spawn('npx', ['mcp-remote', 'https://knowledge-mcp.global.api.aws']);

let buffer = '';

mcp.stdout.on('data', (data) => {
  buffer += data.toString();
});

mcp.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

// Send tools/list request
setTimeout(() => {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  };
  
  mcp.stdin.write(JSON.stringify(request) + '\n');
  
  setTimeout(() => {
    console.log('Response:', buffer);
    mcp.kill();
  }, 3000);
}, 1000);