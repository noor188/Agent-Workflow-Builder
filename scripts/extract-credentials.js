#!/usr/bin/env node

/**
 * Google Sheets Service Account Credential Extractor
 * 
 * This script helps extract the required credentials from a Google Service Account JSON file
 * for use in the Agent Workflow Builder.
 * 
 * Usage: node extract-credentials.js path/to/service-account.json
 */

const fs = require('fs');
const path = require('path');

function extractCredentials(jsonFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error('❌ Error: File not found:', jsonFilePath);
      process.exit(1);
    }

    // Read and parse JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const credentials = JSON.parse(jsonContent);

    // Extract required fields
    const clientEmail = credentials.client_email;
    const privateKey = credentials.private_key;

    if (!clientEmail || !privateKey) {
      console.error('❌ Error: Invalid service account file. Missing client_email or private_key.');
      process.exit(1);
    }

    console.log('✅ Successfully extracted credentials!\n');
    console.log('📋 Add these to your .env.local file:\n');
    console.log('GOOGLE_SHEETS_CLIENT_EMAIL=' + clientEmail);
    console.log('GOOGLE_SHEETS_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
    console.log('\n🔒 Security reminder:');
    console.log('- Never commit these credentials to version control');
    console.log('- Keep your service account JSON file secure');
    console.log('- Share your Google Sheet with this service account email');
    
  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📖 Usage: node extract-credentials.js path/to/service-account.json');
  console.log('\nThis script extracts Google Sheets service account credentials');
  console.log('from a JSON file and formats them for use in .env.local');
  process.exit(0);
}

const jsonFilePath = path.resolve(args[0]);
extractCredentials(jsonFilePath);