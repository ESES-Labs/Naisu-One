# Naisu1 - Autonomous Cross-Chain Liquidity Gateway

> The autonomous gateway for EVM users to safely migrate and deploy liquidity into Solana DeFi via plain English.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Naisu1 is an **autonomous intent-based agent** that enables seamless, verifiable liquidity migration from EVM chains to Solana. Users simply type their DeFi goals in plain English, and Naisu1 autonomously executes across chains with on-chain **Proof-of-Intent**.

### Key Capabilities

- 🌉 **EVM → Solana Bridge** – Safely migrate liquidity from Ethereum/Base to Solana
- 🤖 **Intent-Based Execution** – Describe your goal in natural language, let the agent handle the complexity
- 🔐 **Proof-of-Intent** – Verifiable on-chain record of user intentions and executed actions
- 🧠 **AI-Powered Automation** – Autonomous pathfinding for optimal routes and yields
- 🔄 **Cross-Chain Coordination** – Seamless orchestration across multiple networks
- 🛡️ **Safety First** – Built-in guardrails and policy enforcement for secure operations

---

## Architecture

Naisu1 follows a modular architecture designed to bridge the gap between EVM and Solana ecosystems through an intelligent AI layer.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│    ┌─────────────────────────────────────────────────────────────────────────┐      │
│    │                         Agent Hub (React + Vite)                         │      │
│    │                   Natural Language Intent Interface                      │      │
│    │                                                                          │      │
│    │   User: "Move 1000 USDC from Base to Solana and deposit into Kamino"    │      │
│    │                                                                          │      │
│    └─────────────────────────────────┬───────────────────────────────────────┘      │
│                                      │                                                │
└──────────────────────────────────────┼────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            AI ORCHESTRATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                  agent-infra-langchain-ts (Fastify + LangChain)              │   │
│   │                                                                              │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │   │
│   │  │ Intent       │  │ Cross-Chain  │  │   Memory     │  │  Proof-of-Intent │ │   │
│   │  │ Parser       │  │ Planner      │  │   System     │  │  Verification   │ │   │
│   │  └──────┬───────┘  └──────┬───────┘  └──────────────┘  └─────────────────┘ │   │
│   │         │                 │                                                   │   │
│   │         └─────────────────┼──────────────────┐                               │   │
│   │                           ▼                  ▼                               │   │
│   │                  ┌──────────────────────────────────┐                       │   │
│   │                  │      LLM Provider (OpenAI/      │                       │   │
│   │                  │         Kimi/Heurist)            │                       │   │
│   │                  └──────────────────┬───────────────┘                       │   │
│   └─────────────────────────────────────┼───────────────────────────────────────┘   │
│                                         │                                           │
└─────────────────────────────────────────┼───────────────────────────────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            ▼                            ▼                            ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   naisu-backend     │    │   Bridge Services   │    │  Solana Contracts   │
│   (DeFi Backend)    │    │  (Wormhole/etc)     │    │ (naisu1-program)    │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ • Hono + Bun        │    │ • Cross-chain       │    │ • Anchor Framework  │
│ • Viem (EVM)        │    │   messaging         │    │ • Proof-of-Intent   │
│ • Uniswap V4        │    │ • Asset bridging    │    │   verification      │
│ • Transaction       │    │ • Liquidity         │    │ • Intent recording  │
│   building          │    │   transfer          │    │ • Settlement logic  │
└──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘
           │                          │                          │
           ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BLOCKCHAIN LAYER                                        │
├──────────────────────────────┬──────────────────────────────┬───────────────────────┤
│        EVM Chains            │         Bridge Layer         │    Solana Network     │
├──────────────────────────────┼──────────────────────────────┼───────────────────────┤
│  • Base Mainnet              │    • Wormhole (Token         │  • Solana Mainnet     │
│  • Base Sepolia              │      Bridge)                 │  • Solana Devnet      │
│  • Ethereum                  │    • Cross-chain intents     │                       │
│                              │                              │  • Kamino Finance     │
│  • Uniswap V4 Pools          │                              │  • Solana DeFi        │
│  • ERC-20 Tokens             │                              │    Protocols          │
└──────────────────────────────┴──────────────────────────────┴───────────────────────┘
```

---

## How It Works

### Intent Execution Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         USER INTENT FLOW                                          │
└──────────────────────────────────────────────────────────────────────────────────┘

Step 1: Intent Expression
─────────────────────────
User types in Agent Hub:
"Move 1000 USDC from Base to Solana and deposit into Kamino vault"

         │
         ▼

Step 2: Intent Parsing & Validation
────────────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  AI Agent Infrastructure                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐│
│  │ Natural Language │  │ Intent Schema    │  │ Validation                      ││
│  │ Processing       │──▶│ Extraction       │──▶│ • Source: Base (EVM)            ││
│  │                  │  │                  │  │ • Destination: Solana           ││
│  │ Extract:         │  │ • Action: Bridge │  │ • Asset: USDC                   ││
│  │ - Amount: 1000   │  │ - Deposit        │  │ • Amount: 1000                  ││
│  │ - Token: USDC    │  │ • Token: USDC    │  │ • Target: Kamino                ││
│  │ - Source: Base   │  │ • Amount: 1000   │  │ • Feasibility check             ││
│  │ - Target: Kamino │  │ • Target: Kamino │  │                                 ││
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼

Step 3: Cross-Chain Path Planning
──────────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  AI Planner generates optimal execution path:                                   │
│                                                                                 │
│  1. Lock USDC on Base (via Uniswap/natsu-swap contract)                        │
│  2. Emit cross-chain intent message                                             │
│  3. Verify on Solana via Wormhole                                               │
│  4. Mint/Release USDC on Solana                                                 │
│  5. Deposit into Kamino vault                                                   │
│                                                                                 │
│  Alternative paths evaluated based on:                                          │
│  - Gas costs (source + destination)                                             │
│  - Bridge latency                                                               │
│  - Slippage/yields                                                              │
│  - Protocol fees                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼

Step 4: Transaction Building
────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  naisu-backend (DeFi Backend API)                                               │
│  ┌──────────────────────────────┐  ┌─────────────────────────────────────────┐│
│  │ EVM Transaction Builder      │  │ Solana Transaction Builder              ││
│  │ • Build unsigned approve()   │  │ • Build deposit instruction            ││
│  │ • Build bridge transaction   │  │ • Prepare vault ATA                    ││
│  │ • Estimate gas               │  │ • Compute fees                          ││
│  └──────────────────────────────┘  └─────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼

Step 5: User Confirmation & Signing
────────────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  Agent Hub UI                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Intent Summary:                                                         │   │
│  │  ─────────────────                                                       │   │
│  │  • Send 1000 USDC from Base                                              │   │
│  │  • Receive ~998 USDC on Solana (after bridge fees)                       │   │
│  │  • Auto-deposit into Kamino USDC vault                                   │   │
│  │  • Expected APY: 8.5%                                                    │   │
│  │                                                                          │   │
│  │  [  Approve and Sign  ]                                                  │   │
│  │                                                                          │   │
│  │  User signs with EVM wallet (MetaMask/Rainbow) via Wagmi                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼

Step 6: On-Chain Proof-of-Intent
─────────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  Solana Program (naisu1-program)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Proof-of-Intent Record:                                                 │   │
│  │  ──────────────────────                                                  │   │
│  │  • intent_id: uuid                                                       │   │
│  │  • user_evm_address: 0x...                                               │   │
│  │  • user_solana_address: abc...xyz                                        │   │
│  │  • source_chain: Base (8453)                                             │   │
│  │  • destination_chain: Solana (1399811149)                                │   │
│  │  • asset: USDC                                                           │   │
│  │  • amount: 1000000000 (6 decimals)                                       │   │
│  │  • target_protocol: Kamino                                               │   │
│  │  • timestamp: unix                                                       │
│  │  • status: Pending → Executed                                            │   │
│  │                                                                          │   │
│  │  This creates a verifiable, auditable record of the user's intent        │   │
│  │  that can be used for dispute resolution and compliance.                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼

Step 7: Execution & Settlement
───────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  Cross-Chain Execution                                                        │
│                                                                                 │
│  Base Side:                    Solana Side:                                     │
│  ───────────                   ────────────                                     │
│  [USDC locked]  ────────▶  [Wormhole verifies]                                  │
│       │                           │                                             │
│       │                           ▼                                             │
│       │                    [USDC minted/released]                               │
│       │                           │                                             │
│       │                           ▼                                             │
│       │                    [Auto-deposit to Kamino]                             │
│       │                           │                                             │
│       │                           ▼                                             │
│       │                    [Proof-of-Intent updated]                            │
│       │                           │                                             │
│       │                    [LP tokens issued]                                   │
│       │                                                                 │
│       │◄──────────────────────────────────────────────────────────────────┘
│  [Confirmation receipt]
│
└────────────────────────────────────────────────────────────────────────────────┘

Step 8: Confirmation & Memory
──────────────────────────────
┌────────────────────────────────────────────────────────────────────────────────┐
│  Agent Infrastructure                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • Store successful execution in user memory                             │   │
│  │  • Update portfolio tracking                                             │   │
│  │  • Notify user of completion                                             │   │
│  │  • Suggest follow-up actions (monitor, rebalance, etc.)                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
naisu-one/
├──
├── agent-hub/                   # Intent Interface Dashboard
│   ├── React 18 + TypeScript
│   ├── Vite 5.x
│   ├── Radix UI + Tailwind CSS + shadcn/ui
│   └── Natural language intent input
│
├── agent-infra-langchain-ts/    # Intent Processing Engine
│   ├── Node.js 22+ with ES Modules
│   ├── Fastify 5.x
│   ├── LangChain Core (intent parsing & planning)
│   ├── LLM Provider Factory
│   ├── Cross-chain pathfinding
│   └── Proof-of-Intent verification
│
├── naisu-backend/               # Cross-Chain Transaction Builder
│   ├── Bun 1.0+
│   ├── Hono 4.x
│   ├── Viem 2.x (EVM tx building)
│   ├── Uniswap V4 integration
│   └── Bridge coordination
│
├── naisu1-fe/                   # DeFi Frontend (EVM side)
│   ├── React 19 + TypeScript
│   ├── Vite 6.x
│   ├── Wagmi 3.x + Viem
│   └── Wallet connection & signing
│
├── naisu1-program/              # Solana Proof-of-Intent Contracts
│   ├── Anchor 0.32.x
│   ├── Rust
│   ├── Intent recording
│   └── Settlement verification
│
├── naisu1-contracts/            # EVM Bridge & Swap Contracts
│   └── Solidity (Uniswap V4 hooks)
│
└── naisu1-solver/               # Intent Solver/Relayer
    └── Cross-chain execution coordination
```

---

## Key Components

### 1. Intent Parser (agent-infra-langchain-ts)

Converts natural language into structured DeFi intents:

```typescript
// Example intent structure
interface DeFiIntent {
  action: 'bridge' | 'swap' | 'deposit' | 'withdraw';
  sourceChain: 'base' | 'ethereum';
  destinationChain: 'solana';
  token: {
    symbol: 'USDC' | 'USDT' | 'SOL';
    amount: string;
  };
  targetProtocol?: 'kamino' | 'marinade' | 'jito';
  slippageTolerance?: number;
}
```

### 2. Proof-of-Intent (naisu1-program)

On-chain verification and recording system:

```rust
// Solana program structure
pub struct IntentRecord {
    pub intent_id: [u8; 32],
    pub user_evm: [u8; 20],
    pub user_solana: Pubkey,
    pub source_chain: u16,
    pub destination_chain: u16,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub target_program: Pubkey,
    pub status: IntentStatus,
    pub created_at: i64,
    pub executed_at: Option<i64>,
}
```

### 3. Cross-Chain Pathfinder

AI-powered optimal route calculation considering:
- Bridge fees and latency
- Gas costs on both chains
- Slippage estimates
- Protocol yields
- Security ratings

---

## Getting Started

### Prerequisites

- Node.js 22+
- Bun 1.0+
- Rust + Anchor CLI (for Solana)
- EVM wallet (MetaMask, Rainbow, etc.)
- Solana wallet (Phantom, Solflare, etc.)

### Quick Setup

#### 1. Clone and install dependencies

```bash
git clone https://github.com/your-org/naisu-one.git
cd naisu-one
```

#### 2. Setup Intent Processing Engine

```bash
cd agent-infra-langchain-ts
npm install
cp .env.example .env
# Configure LLM provider and memory backend
npm run dev
```

#### 3. Setup Cross-Chain Backend

```bash
cd naisu-backend
bun install
cp .env.example .env
# Configure EVM RPCs and bridge endpoints
bun run dev
```

#### 4. Setup Solana Contracts

```bash
cd naisu1-program
yarn install
anchor build
anchor deploy --provider.cluster devnet
```

#### 5. Setup Intent Interface

```bash
cd agent-hub
npm install
npm run dev
```

---

## API Reference

### Intent API (Port 8787)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/intent` | POST | Submit natural language intent |
| `/v1/intent/:id` | GET | Get intent status & proof |
| `/v1/intent/:id/execute` | POST | Execute approved intent |
| `/v1/pathfinder/quote` | GET | Get cross-chain route quote |
| `/v1/proof/verify` | POST | Verify Proof-of-Intent |

### Transaction Builder API (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/bridge/build` | POST | Build bridge transaction |
| `/api/v1/swap/quote` | GET | Get swap quote |
| `/api/v1/swap/build` | POST | Build swap transaction |
| `/api/v1/deposit/build` | POST | Build deposit transaction |

---

## Supported Routes

| From | To | Bridge | Protocols |
|------|-----|--------|-----------|
| Base | Solana | Wormhole | Kamino, Marinade, Jito |
| Ethereum | Solana | Wormhole | Kamino, Marinade |
| Base | Solana | LayerZero | (Coming soon) |

---

## Security Model

### Proof-of-Intent Verification

Every cross-chain operation creates a verifiable on-chain record:

1. **Intent Commitment** – Hashed intent stored on-chain before execution
2. **Execution Verification** – Multi-sig verification from bridge guardians
3. **Settlement Proof** – Final state recorded on Solana
4. **Dispute Resolution** – On-chain evidence for conflict resolution

### Safety Mechanisms

- **Slippage Protection** – Configurable max slippage per intent
- **Rate Limiting** – Per-user and global rate limits
- **Amount Limits** – Tiered limits based on verification level
- **Emergency Pause** – Circuit breaker for critical issues
- **MEV Protection** – Time-delayed execution for large orders

---

## Development

### Running Tests

```bash
# Solana program tests
cd naisu1-program
anchor test

# Backend tests
cd naisu-backend
bun test

# Agent tests
cd agent-infra-langchain-ts
npm run test
```

### Local Development Flow

```bash
# 1. Start local validator (Solana)
solana-test-validator

# 2. Deploy local programs
anchor deploy --provider.cluster localnet

# 3. Start backend services
# (in separate terminals)
cd naisu-backend && bun run dev
cd agent-infra-langchain-ts && npm run dev

# 4. Start frontend
cd agent-hub && npm run dev
```

---

## Deployment

GitHub Actions workflows handle deployment:

- **Agent Hub** → Vercel
- **Intent Engine** → VPS
- **Transaction Builder** → VPS
- **Solana Program** → Devnet/Mainnet via Anchor

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Intent AI | LangChain, OpenAI/Kimi, Zod |
| EVM | Viem, Wagmi, Uniswap V4 |
| Solana | Anchor, Rust, Web3.js |
| Bridge | Wormhole SDK |
| Frontend | React, Vite, Tailwind |
| Backend | Fastify, Hono, Bun |

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Support

- 📧 support@naisu.one
- 🐦 [@naisu_one](https://twitter.com/naisu_one)

---

<p align="center">Bridging EVM and Solana with AI-powered intents 🌉</p>
