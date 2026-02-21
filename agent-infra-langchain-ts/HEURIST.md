Heurist Mesh Overview
AI Agents as a Service - Modular, flexible, and crypto-native AI agents ready to use

Heurist Mesh Integrations
​
What is Heurist Mesh?
Heurist Mesh is the skills marketplace for AI agents. General-purpose AI models lack specialized knowledge about Web3, and often fail to deliver accurate and relevant results. Heurist Mesh solves this by providing a marketplace of specialized AI agents that are experts in crypto analytics, ready to give your applications or agents the crypto expertise they need.
Composable Architecture: Mix and match specialized agents for different tasks
Flexible Access: We support REST API with API key access, x402-enabled pay-per-use API, and MCP access. Agents are registered with ERC-8004 Trusted Agents standard.
Curated Web3 Tools: We curate the best Web3 tools to give your agents the best possible performance. We constantly monitor and update the tools we use to ensure they are always performant.
Optimized for Agents: The input and output formats are optimized for AI agents to easily comprehend and use. Tool call rounds are reduced by 70% and token usage is reduced by 30~50% compared to simple API wrappers.
​
Get Started
Mesh Portal: Visit mesh.heurist.ai to browse all agents and deploy dedicated MCP servers
Agent List: View the complete agent list on GitHub
API: See the API documentation for REST and x402 integration
MCP: See the MCP documentation for MCP server access
ERC-8004 Discoverability: Visit 8004scan and search for “Heurist Mesh” for the full list of registered agents on Ethereum.
Skill for Moltbot (formerly Clawdbot): Install Heurist Mesh Skill and turn your Moltbot into a crypto expert.
​
Available Agents
Heurist Mesh provides 30+ specialized agents spanning across these categories:
Aggregated crypto insights (Recommended for crypto use cases)
Token Resolver: get detailed informationa and market data for any token
Twitter Intelligence: smart search on Twitter
Trending Tokens: find trending tokens across all chains and social media
Token information (CoinGecko, DexScreener, Bitquery, etc.)
Social media (Twitter, Elfa, Moni, etc.)
Blockchain data (Etherscan, ChainBase, Space and Time, etc.)
Web Search (Exa, Firecrawl, with AI extraction and summarization)
Crypto products (Pump.fun, LetsBonk, Zora, etc.)
Wallet analysis (Pond AI, GoPlus, Zerion, etc.)

API
​
Base URL
https://mesh.heurist.xyz
​
Agent Discovery
Browse all agents at mesh.heurist.ai, or fetch the metadata endpoint for the full list of agents, tools, and parameters:
https://mesh.heurist.ai/metadata.json
​
REST API
All requests require an API key in the request body.
​
POST /mesh_request
{
  "api_key": "your_api_key",
  "agent_id": "CoinGeckoTokenInfoAgent",
  "input": {
    // Option 1: Natural language query
    "query": "What is the current price of Bitcoin?",

    // Option 2: Direct tool call
    "tool": "get_token_info",
    "tool_arguments": { "coingecko_id": "ethereum" },

    "raw_data_only": false  // optional, omit LLM summary if true
  }
}
Response:
{
  "result": { /* agent-specific response data */ }
}
​
Example
const response = await fetch("https://mesh.heurist.xyz/mesh_request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: "YOUR_API_KEY",
    agent_id: "CoinGeckoTokenInfoAgent",
    input: {
      tool: "get_token_info",
      tool_arguments: { coingecko_id: "ethereum" },
      raw_data_only: true
    }
  })
});

