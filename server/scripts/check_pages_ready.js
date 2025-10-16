#!/usr/bin/env node
// Script to check if GitHub Pages URL is ready
import { pollPagesUrl } from '../src/utils/pagesChecker.js';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: node scripts/check_pages_ready.js <pages_url> [timeout_seconds]');
  console.log('Example: node scripts/check_pages_ready.js https://username.github.io/repo/ 300');
  process.exit(1);
}

const pagesUrl = args[0];
const timeoutSeconds = args[1] ? parseInt(args[1]) : 540; // Default 9 minutes

console.log('Checking Pages URL:', pagesUrl);
console.log('Timeout:', timeoutSeconds, 'seconds');

const ready = await pollPagesUrl(pagesUrl, timeoutSeconds * 1000);

if (ready) {
  console.log('\\nPages are ready!');
  process.exit(0);
} else {
  console.error('\\nPages not ready within timeout');
  process.exit(1);
}
