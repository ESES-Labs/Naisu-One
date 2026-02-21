#!/usr/bin/env node

/**
 * Generate a secure API key for the Agent Infra API
 * 
 * Usage:
 *   node scripts/generate-api-key.js
 *   node scripts/generate-api-key.js --prefix myapp
 *   node scripts/generate-api-key.js --help
 */

const crypto = require('crypto');

function generateApiKey(options = {}) {
  const {
    prefix = 'sk',
    length = 64,
    separator = '-'
  } = options;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Add timestamp segment for uniqueness
  const timestamp = Date.now().toString(36).toUpperCase();
  
  return `${prefix}${separator}${timestamp}${separator}${key}`;
}

function showHelp() {
  console.log(`
Generate Secure API Key
=======================

Usage:
  node generate-api-key.js [options]

Options:
  --prefix <string>    Key prefix (default: "sk")
  --length <number>    Random part length (default: 64)
  --separator <char>   Separator character (default: "-")
  --count <number>     Generate multiple keys (default: 1)
  --help               Show this help

Examples:
  node generate-api-key.js
  node generate-api-key.js --prefix prod --length 32
  node generate-api-key.js --count 5
`);
}

function main() {
  const args = process.argv.slice(2);
  
  // Check for help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Parse arguments
  const options = {
    prefix: 'sk',
    length: 64,
    separator: '-',
    count: 1
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--prefix':
        if (nextArg) options.prefix = nextArg;
        i++;
        break;
      case '--length':
        if (nextArg) options.length = parseInt(nextArg, 10);
        i++;
        break;
      case '--separator':
        if (nextArg) options.separator = nextArg;
        i++;
        break;
      case '--count':
        if (nextArg) options.count = parseInt(nextArg, 10);
        i++;
        break;
    }
  }

  // Generate keys
  console.log('\n🗝️  Generated API Keys\n');
  console.log('=' .repeat(80));
  
  for (let i = 0; i < options.count; i++) {
    const key = generateApiKey(options);
    console.log(`\n${i + 1}. ${key}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Usage:');
  console.log('   Add to your .env file:');
  console.log('   API_KEY_REQUIRED=true');
  console.log(`   API_KEY=${options.count === 1 ? generateApiKey(options) : '<one-of-the-above>'}`);
  console.log('\n🔒 Security Tips:');
  console.log('   - Keep your API keys secret');
  console.log('   - Rotate keys regularly');
  console.log('   - Use different keys for different environments');
  console.log('   - Store keys in environment variables, not in code');
  console.log('');
}

main();
