#!/usr/bin/env node
// Standalone script to generate app from brief and attachments
import { generate } from '../src/utils/llmGenerator.js';
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: node scripts/generate_app.js <brief> [attachments.json]');
  console.log('Example: node scripts/generate_app.js "Create a sum of sales calculator"');
  process.exit(1);
}

const brief = args[0];
let attachments = [];

if (args[1]) {
  const attachmentsFile = args[1];
  const data = await fs.readFile(attachmentsFile, 'utf-8');
  attachments = JSON.parse(data);
}

console.log('Generating application...');
console.log('Brief:', brief);
console.log('Attachments:', attachments.length);

const files = await generate(brief, attachments, [], { 
  task: 'test-task', 
  round: 1, 
  nonce: 'test' 
});

// Write to output directory
const outputDir = path.join(process.cwd(), 'generated-output');
await fs.mkdir(outputDir, { recursive: true });

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(outputDir, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  
  if (content instanceof Buffer) {
    await fs.writeFile(fullPath, content);
  } else {
    await fs.writeFile(fullPath, content, 'utf-8');
  }
  
  console.log('Created:', filePath);
}

console.log('\\nGeneration complete! Output in:', outputDir);
