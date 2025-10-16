// GitHub Helper - creates repos, commits, and enables Pages
import { Octokit } from '@octokit/rest';
import { checkForSecrets } from './safeGitUtils.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Get environment variables dynamically (not at import time)
function getGitHubToken() {
  return process.env.GITHUB_TOKEN;
}

function getGitHubUser() {
  return process.env.GITHUB_USER_OR_ORG;
}

function getOctokit() {
  return new Octokit({ auth: getGitHubToken() });
}

/**
 * Create GitHub repository and push files
 * @param {Object} options - Configuration
 * @param {string} options.repoName - Repository name
 * @param {Object} options.files - File tree (path: content)
 * @param {string} options.email - Student email
 * @param {string} options.task - Task name
 * @param {string} options.brief - Task brief
 * @returns {Object} { repo_url, commit_sha, pages_url }
 */
export async function createRepoAndPush({ repoName, files, email, task, brief }) {
  console.log(`Creating repository: ${repoName}`);
  
  // Add MIT LICENSE
  files['LICENSE'] = generateMITLicense(email);
  
  // Check all files for secrets
  for (const [filePath, content] of Object.entries(files)) {
    if (content instanceof Buffer) continue; // Skip binary files
    const violations = checkForSecrets(content);
    if (violations.length > 0) {
      console.warn(`WARNING: Potential secrets found in ${filePath}:`, violations);
      // Redact secrets
      let cleaned = content;
      for (const violation of violations) {
        cleaned = cleaned.replace(new RegExp(violation, 'g'), '***REDACTED***');
      }
      files[filePath] = cleaned;
    }
  }
  
  try {
    // Try gh CLI first (it's more reliable for empty repos)
    const GITHUB_USER = getGitHubUser();
    const GITHUB_TOKEN = getGitHubToken();
    
    if (!GITHUB_USER || !GITHUB_TOKEN) {
      throw new Error('Missing GITHUB_TOKEN or GITHUB_USER_OR_ORG environment variables');
    }
    
    // Check if gh CLI is available
    try {
      execSync('gh --version', { stdio: 'pipe' });
      console.log('Using gh CLI (more reliable for new repos)...');
      return await createRepoViaGhCLI({ repoName, files, email, task, brief });
    } catch (ghError) {
      console.log('gh CLI not available, falling back to Octokit API...');
    }
    
    // Fallback to Octokit API
    const octokit = getOctokit();
    
    // Step 1: Create repository with auto_init to avoid empty repo issues
    console.log('Creating GitHub repository...');
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: `${task} - ${brief.substring(0, 100)}`,
      public: true,
      auto_init: true  // Initialize with README to avoid empty repo
    });
    
    console.log(`Repository created: ${repo.html_url}`);
    
    // Wait a moment for GitHub to initialize the repo
    await new Promise(resolve => setTimeout(resolve, 9000)); // Wait 9 seconds
    
    // Get the current main branch ref to use as parent
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_USER,
      repo: repoName,
      ref: 'heads/main'
    });
    const parentSha = ref.object.sha;
    
    // Step 2: Create files via GitHub API (tree + commit)
    console.log('Creating files...');
    const fileBlobs = [];
    
    for (const [filePath, content] of Object.entries(files)) {
      const blob = await octokit.git.createBlob({
        owner: GITHUB_USER,
        repo: repoName,
        content: content instanceof Buffer ? content.toString('base64') : content,
        encoding: content instanceof Buffer ? 'base64' : 'utf-8'
      });
      
      fileBlobs.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: blob.data.sha
      });
    }
    
    // Step 3: Create tree
    const { data: tree } = await octokit.git.createTree({
      owner: GITHUB_USER,
      repo: repoName,
      tree: fileBlobs
    });
    
    // Step 4: Create commit (with parent this time)
    const { data: commit } = await octokit.git.createCommit({
      owner: GITHUB_USER,
      repo: repoName,
      message: `Initial commit - ${task}`,
      tree: tree.sha,
      parents: [parentSha]  // Link to the auto-init commit
    });
    
    console.log(`Commit created: ${commit.sha}`);
    
    // Step 5: Update main branch reference (use updateRef instead of createRef)
    await octokit.git.updateRef({
      owner: GITHUB_USER,
      repo: repoName,
      ref: 'heads/main',
      sha: commit.sha,
      force: true
    });
    
    // Step 6: Enable GitHub Pages
    console.log('Enabling GitHub Pages...');
    let pagesUrl = `https://${GITHUB_USER}.github.io/${repoName}/`;
    
    try {
      await octokit.repos.createPagesSite({
        owner: GITHUB_USER,
        repo: repoName,
        source: {
          branch: 'main',
          path: '/'
        }
      });
      console.log('GitHub Pages enabled successfully');
    } catch (pagesError) {
      console.warn('Could not enable Pages via API:', pagesError.message);
      console.log('Pages may need to be enabled manually');
    }
    
    return {
      repo_url: repo.html_url,
      commit_sha: commit.sha,
      pages_url: pagesUrl
    };
    
  } catch (error) {
    console.error('Error creating repository:', error.message);
    
    // Fallback to gh CLI if available
    if (error.status === 401 || error.status === 403) {
      console.log('Attempting fallback to gh CLI...');
      return createRepoViaGhCLI({ repoName, files, email, task, brief });
    }
    
    throw error;
  }
}

/**
 * Fallback: Create repo using gh CLI
 */
async function createRepoViaGhCLI({ repoName, files, email, task, brief }) {
  console.log('Using gh CLI fallback...');
  
  const GITHUB_USER = getGitHubUser();
  
  try {
    // Check if gh is installed
    execSync('gh --version', { stdio: 'pipe' });
  } catch {
    throw new Error('gh CLI not found. Install from https://cli.github.com/');
  }
  
  // Create temp directory
  const tempDir = path.join(process.cwd(), 'generated-repos', repoName);
  await fs.mkdir(tempDir, { recursive: true });
  
  try {
    // Write files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      if (content instanceof Buffer) {
        await fs.writeFile(fullPath, content);
      } else {
        await fs.writeFile(fullPath, content, 'utf-8');
      }
    }
    
    // Initialize git repo
    execSync('git init', { cwd: tempDir, stdio: 'pipe' });
    execSync('git add .', { cwd: tempDir, stdio: 'pipe' });
    execSync(`git commit -m "Initial commit - ${task}"`, { cwd: tempDir, stdio: 'pipe' });
    execSync('git branch -M main', { cwd: tempDir, stdio: 'pipe' }); // Ensure branch is named 'main'
    
    // Create GitHub repo and push
    const createOutput = execSync(`gh repo create ${repoName} --public --source=. --remote=origin`, { cwd: tempDir, encoding: 'utf-8' });
    console.log('Repo created, now pushing...');
    execSync('git push -u origin main', { cwd: tempDir, stdio: 'pipe' });
    
    console.log(`Repository created: https://github.com/${GITHUB_USER}/${repoName}`);
    
    // Wait for GitHub to process the repo and verify main branch exists
    console.log('Waiting for GitHub to process the repository...');
    const octokitClient = getOctokit();
    let branchExists = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      try {
        await octokitClient.repos.getBranch({
          owner: GITHUB_USER,
          repo: repoName,
          branch: 'main'
        });
        branchExists = true;
        console.log('Main branch confirmed to exist');
        break;
      } catch (error) {
        console.log(`Waiting for main branch to be available... (attempt ${i + 1}/15)`);
      }
    }
    
    if (!branchExists) {
      console.warn('Main branch not detected after 45 seconds, but continuing...');
    }
    
    // Enable Pages using Octokit API (more reliable)
    console.log('Enabling GitHub Pages...');
    try {
      await octokitClient.repos.createPagesSite({
        owner: GITHUB_USER,
        repo: repoName,
        source: {
          branch: 'main',
          path: '/'
        }
      });
      console.log('GitHub Pages enabled successfully');
    } catch (pagesError) {
      console.warn('Could not enable Pages via API:', pagesError.message);
      // Try gh CLI as fallback
      try {
        execSync(`gh api repos/${GITHUB_USER}/${repoName}/pages -X POST -f source[branch]=main -f source[path]=/`, 
          { cwd: tempDir, stdio: 'pipe' });
        console.log('GitHub Pages enabled via gh CLI');
      } catch {
        console.warn('Could not enable Pages via gh CLI either');
      }
    }
    
    // Get commit SHA
    const commitSha = execSync('git rev-parse HEAD', { cwd: tempDir, encoding: 'utf-8' }).trim();
    
    return {
      repo_url: `https://github.com/${GITHUB_USER}/${repoName}`,
      commit_sha: commitSha,
      pages_url: `https://${GITHUB_USER}.github.io/${repoName}/`
    };
    
  } finally {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function generateMITLicense(email) {
  const year = new Date().getFullYear();
  const author = email || 'Author';
  
  return `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
}
