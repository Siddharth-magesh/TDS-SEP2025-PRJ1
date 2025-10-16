#!/usr/bin/env node
// Standalone script to create GitHub repo and push files
import { createRepoAndPush } from '../src/utils/githubHelper.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/create_repo_and_push.js <repoName> <filesDir>');
  console.log('Example: node scripts/create_repo_and_push.js my-test-repo ./generated-output');
  process.exit(1);
}

const repoName = args[0];
const filesDir = args[1];

console.log('Creating repository:', repoName);
console.log('Loading files from:', filesDir);

// Read all files from directory
const files = {};

async function readDirRecursive(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await readDirRecursive(fullPath, baseDir);
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const content = await fs.readFile(fullPath);
      
      // Detect if binary
      const isBinary = content.some(byte => byte === 0);
      files[relativePath] = isBinary ? content : content.toString('utf-8');
      
      console.log('Loaded:', relativePath);
    }
  }
}

await readDirRecursive(filesDir);

console.log(`\\nLoaded ${Object.keys(files).length} files`);
console.log('Creating GitHub repository...');

try {
  const result = await createRepoAndPush({
    repoName,
    files,
    email: 'test@example.com',
    task: repoName,
    brief: 'Manual repository creation via script'
  });
  
  console.log('\\nRepository created successfully!');
  console.log('Repository URL:', result.repo_url);
  console.log('Commit SHA:', result.commit_sha);
  console.log('Pages URL:', result.pages_url);
  
} catch (error) {
  console.error('\\nError creating repository:', error.message);
  process.exit(1);
}
