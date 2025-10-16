// Main task handler - orchestrates the entire workflow
import { verifySecret } from './verifySecret.js';
import { generate } from '../utils/llmGenerator.js';
import { createRepoAndPush } from '../utils/githubHelper.js';
import { notifyEvaluator } from '../utils/notifier.js';
import { pollPagesUrl } from '../utils/pagesChecker.js';
import fs from 'fs/promises';
import path from 'path';

export async function handleTask(body) {
  const timestamp = new Date().toISOString();
  const { email, secret, task, round, nonce, brief, checks, evaluation_url, attachments } = body;
  
  // Validate required fields
  if (!secret || !task || !brief || !evaluation_url) {
    const error = new Error('Missing required fields: secret, task, brief, evaluation_url');
    error.statusCode = 400;
    throw error;
  }
  
  // Verify secret first
  verifySecret(secret);
  
  console.log(`[${timestamp}] Task accepted: ${task}, Round: ${round || 1}`);
  
  // Respond immediately with acceptance
  const response = {
    status: 'accepted',
    task,
    round: round || 1,
    timestamp
  };
  
  // Start async processing (non-blocking)
  processTaskAsync({
    email,
    task,
    round: round || 1,
    nonce,
    brief,
    checks: checks || [],
    evaluation_url,
    attachments: attachments || []
  }).catch(error => {
    console.error(`[${timestamp}] Async processing failed:`, error);
  });
  
  return response;
}

async function processTaskAsync(data) {
  const startTime = Date.now();
  const { email, task, round, nonce, brief, checks, evaluation_url, attachments } = data;
  
  let repo_url = '';
  let commit_sha = '';
  let pages_url = '';
  let status = 'success';
  
  try {
    console.log(`[${new Date().toISOString()}] Starting async processing for ${task}`);
    
    // Step 1: Generate app files using LLM generator
    console.log('Step 1: Generating application files...');
    const generatedFiles = await generate(brief, attachments, checks, { task, round, nonce });
    
    // Step 2: Create unique repo name
    const repoName = `${task}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    console.log(`Step 2: Creating repository: ${repoName}`);
    
    // Step 3: Create GitHub repo and push
    const githubResult = await createRepoAndPush({
      repoName,
      files: generatedFiles,
      email,
      task,
      brief
    });
    
    repo_url = githubResult.repo_url;
    commit_sha = githubResult.commit_sha;
    pages_url = githubResult.pages_url;
    
    console.log(`Repository created: ${repo_url}`);
    console.log(`Commit SHA: ${commit_sha}`);
    console.log(`Pages URL: ${pages_url}`);
    
    // Step 4: Wait for GitHub Pages to be ready
    console.log('Step 4: Waiting for GitHub Pages to be ready...');
    const pagesReady = await pollPagesUrl(pages_url, 9 * 60 * 1000); // 9 minutes
    
    if (!pagesReady) {
      console.warn('GitHub Pages did not return 200 within timeout');
      status = 'pages_timeout';
    }
    
    // Step 5: Notify evaluator
    console.log('Step 5: Notifying evaluator...');
    const notificationPayload = {
      email,
      task,
      round,
      nonce,
      repo_url,
      commit_sha,
      pages_url,
      status,
      timestamp: new Date().toISOString()
    };
    
    const notifySuccess = await notifyEvaluator(evaluation_url, notificationPayload);
    
    if (!notifySuccess) {
      console.error('Failed to notify evaluator after all retries');
      // Write failure record
      await fs.writeFile(
        path.join(process.cwd(), 'notify-failure.json'),
        JSON.stringify({ ...notificationPayload, error: 'All notification attempts failed' }, null, 2)
      );
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[${new Date().toISOString()}] Task completed in ${elapsed}s`);
    
  } catch (error) {
    console.error('Error in async processing:', error);
    
    // Try to notify evaluator of failure
    try {
      await notifyEvaluator(evaluation_url, {
        email,
        task,
        round,
        nonce,
        repo_url: repo_url || 'N/A',
        commit_sha: commit_sha || 'N/A',
        pages_url: pages_url || 'N/A',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (notifyError) {
      console.error('Failed to notify evaluator of error:', notifyError);
    }
    
    // Write error log
    await fs.writeFile(
      path.join(process.cwd(), 'last-error.log'),
      `${new Date().toISOString()}\n${error.stack || error.message}\n`
    );
  }
}
