#!/usr/bin/env node
// Standalone script to notify evaluator with retry logic
import { notifyEvaluator } from '../src/utils/notifier.js';
import dotenv from 'dotenv';

dotenv.config();

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/notify_evaluator.js <evaluation_url> <payload.json>');
  console.log('Example: node scripts/notify_evaluator.js https://example.com/notify payload.json');
  process.exit(1);
}

const evaluationUrl = args[0];
const payloadFile = args[1];

console.log('Loading payload from:', payloadFile);

const fs = await import('fs/promises');
const payloadData = await fs.readFile(payloadFile, 'utf-8');
const payload = JSON.parse(payloadData);

console.log('Notifying evaluator at:', evaluationUrl);
console.log('Payload:', JSON.stringify(payload, null, 2));

const success = await notifyEvaluator(evaluationUrl, payload);

if (success) {
  console.log('\\nNotification successful!');
  process.exit(0);
} else {
  console.error('\\nNotification failed after all retries');
  process.exit(1);
}
