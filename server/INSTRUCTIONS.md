# Complete Setup Instructions

This document provides step-by-step instructions for setting up and operating the LLM Code Deployment Server.

---

## Table of Contents

1. [Creating a GitHub Personal Access Token](#1-creating-a-github-personal-access-token)
2. [Setting Environment Variables](#2-setting-environment-variables)
3. [Running the Application Locally](#3-running-the-application-locally)
4. [Publishing to GitHub Pages](#4-publishing-to-github-pages)
5. [Checking Pages URL Status](#5-checking-pages-url-status)
6. [Removing Secrets from Git History](#6-removing-secrets-from-git-history)
7. [Inspecting Logs and Debugging](#7-inspecting-logs-and-debugging)
8. [Running Playwright Tests](#8-running-playwright-tests)
9. [Feedback and Round 2 Updates](#9-feedback-and-round-2-updates)

---

## 1. Creating a GitHub Personal Access Token

### Step 1.1: Navigate to GitHub Settings

1. Log in to [github.com](https://github.com)
2. Click your profile picture in the top-right corner
3. Select **Settings** from the dropdown menu

### Step 1.2: Access Developer Settings

1. Scroll down to the bottom of the left sidebar
2. Click **Developer settings**
3. Click **Personal access tokens**
4. Select **Tokens (classic)**

### Step 1.3: Generate New Token

1. Click **Generate new token** > **Generate new token (classic)**
2. Enter a note to identify the token: "LLM Code Deployment Server"
3. Set expiration: Choose **90 days** or **No expiration** (use caution with no expiration)

### Step 1.4: Select Scopes

Check the following scopes:

- ✅ **repo** (Full control of private repositories)
  - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
- ✅ **workflow** (Update GitHub Action workflows)
- ✅ **public_repo** (Access public repositories)

### Step 1.5: Generate and Save Token

1. Scroll to bottom and click **Generate token**
2. **IMPORTANT:** Copy the token immediately (starts with `ghp_`)
3. Store it securely - you cannot view it again!
4. Paste it into your `.env` file as `GITHUB_TOKEN`

---

## 2. Setting Environment Variables

### 2.1: Create Environment File

**Windows PowerShell:**
```powershell
cd server
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cd server
cp .env.example .env
```

### 2.2: Edit Environment File

Open `.env` in your text editor and fill in the values:

```env
# Server configuration
PORT=3000
WORKER_SECRET=my-super-secret-key-12345

# GitHub configuration
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_USER_OR_ORG=your-github-username

# Optional: For testing
TEST_EVALUATION_URL=http://localhost:3000/test-evaluator
```

### 2.3: Set Environment Variables (Alternative Methods)

**Windows PowerShell (Session-level):**
```powershell
$env:WORKER_SECRET="my-super-secret-key-12345"
$env:GITHUB_TOKEN="ghp_your_actual_token_here"
$env:GITHUB_USER_OR_ORG="your-github-username"
```

**Windows PowerShell (Permanent - User level):**
```powershell
[System.Environment]::SetEnvironmentVariable('WORKER_SECRET', 'my-super-secret-key-12345', 'User')
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'ghp_your_actual_token_here', 'User')
[System.Environment]::SetEnvironmentVariable('GITHUB_USER_OR_ORG', 'your-github-username', 'User')
```

**Linux/Mac (Session-level):**
```bash
export WORKER_SECRET="my-super-secret-key-12345"
export GITHUB_TOKEN="ghp_your_actual_token_here"
export GITHUB_USER_OR_ORG="your-github-username"
```

**Linux/Mac (Permanent - add to ~/.bashrc or ~/.zshrc):**
```bash
echo 'export WORKER_SECRET="my-super-secret-key-12345"' >> ~/.bashrc
echo 'export GITHUB_TOKEN="ghp_your_actual_token_here"' >> ~/.bashrc
echo 'export GITHUB_USER_OR_ORG="your-github-username"' >> ~/.bashrc
source ~/.bashrc
```

---

## 3. Running the Application Locally

### 3.1: Install Dependencies

```bash
cd server
npm install
```

This will install:
- Express (HTTP server)
- Octokit (GitHub API client)
- Axios (HTTP client)
- Playwright (Testing framework)

### 3.2: Start the Server

```bash
npm start
```

You should see:
```
[2025-10-15T12:00:00.000Z] Server running on port 3000
Environment: development
```

If you see warnings about missing environment variables, go back to Step 2.

### 3.3: Test with a Simulated Request

**Windows PowerShell:**
```powershell
.\scripts\simulate_request.ps1
```

**Linux/Mac:**
```bash
bash scripts/simulate_request.sh
```

**Manual curl (any platform with curl):**
```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "secret": "my-super-secret-key-12345",
    "task": "test-task-123",
    "round": 1,
    "nonce": "test-nonce",
    "brief": "Create a simple sum of sales calculator",
    "checks": ["Repo has MIT license"],
    "evaluation_url": "http://localhost:3000/test-evaluator",
    "attachments": []
  }'
```

### 3.4: Monitor Logs

Watch the server console for progress:
- Task acceptance
- File generation
- Repository creation
- Pages enablement
- Notification attempts

Check log files:
```bash
# View task log
cat tasks-log.json | jq .

# View last notification
cat last-notify.json | jq .
```

---

## 4. Publishing to GitHub Pages

### 4.1: Automatic Publishing (via Server)

The server automatically enables GitHub Pages when it creates a repository. No manual action required!

### 4.2: Manual Publishing (GitHub UI)

If automatic publishing fails:

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar under "Code and automation")
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 2-5 minutes for deployment
7. Your site will be available at: `https://username.github.io/repo-name/`

### 4.3: Manual Publishing (gh CLI)

Install GitHub CLI from [cli.github.com](https://cli.github.com/), then:

```bash
# Login to GitHub
gh auth login

# Enable Pages for a repository
gh api repos/USERNAME/REPO_NAME/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/
```

Replace `USERNAME` and `REPO_NAME` with your values.

### 4.4: Verify Pages Deployment

Check status with:

```bash
gh api repos/USERNAME/REPO_NAME/pages
```

Or use the server script:

```bash
node scripts/check_pages_ready.js https://username.github.io/repo-name/ 300
```

---

## 5. Checking Pages URL Status

### 5.1: Using Browser

Simply visit the Pages URL: `https://username.github.io/repo-name/`

- If you see your page: ✅ Success!
- If you see 404: ⏳ Still deploying or ❌ Configuration error

### 5.2: Using curl

```bash
curl -I https://username.github.io/repo-name/
```

Look for:
- `HTTP/2 200` - Page is ready ✅
- `HTTP/2 404` - Not found ❌

### 5.3: Using the Server Script

```bash
node scripts/check_pages_ready.js https://username.github.io/repo-name/ 300
```

This will poll for up to 300 seconds (5 minutes).

### 5.4: Common Issues

**404 Error After 10+ Minutes:**
- Check repository is **public** (Settings > General > Danger Zone)
- Verify Pages is enabled (Settings > Pages)
- Check branch name is `main` (not `master`)
- Verify `index.html` exists in repository root

**DNS Issues:**
- Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Try incognito/private browsing mode
- Check DNS propagation: `nslookup username.github.io`

**Build Failures:**
- Check Actions tab in repository for errors
- Review repository files for syntax errors
- Check GitHub Status: [githubstatus.com](https://www.githubstatus.com/)

---

## 6. Removing Secrets from Git History

### ⚠️ CRITICAL: If you accidentally committed secrets

**STOP immediately and follow these steps:**

### 6.1: Backup Your Repository

```bash
cd /path/to/your/repo
git clone --mirror . ../repo-backup.git
```

### 6.2: Using git-filter-repo (Recommended)

**Install git-filter-repo:**

**Windows (with Python):**
```powershell
pip install git-filter-repo
```

**Mac:**
```bash
brew install git-filter-repo
```

**Linux:**
```bash
pip3 install git-filter-repo
```

**Remove secrets:**
```bash
# Replace YOUR_SECRET_HERE with the actual secret
git filter-repo --replace-text <(echo "YOUR_SECRET_HERE==>***REDACTED***")
```

**Force push:**
```bash
git push origin --force --all
```

### 6.3: Using BFG Repo-Cleaner (Alternative)

**Download BFG:**
```bash
# Download from https://rtyley.github.io/bfg-repo-cleaner/
# Or with Homebrew (Mac):
brew install bfg
```

**Create passwords.txt:**
```
YOUR_SECRET_HERE
ghp_your_token_here
```

**Clean history:**
```bash
bfg --replace-text passwords.txt your-repo-folder/
cd your-repo-folder
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

### 6.4: Revoke Compromised Tokens

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Find the compromised token
3. Click **Revoke** and confirm
4. Generate a new token (see Section 1)
5. Update your `.env` file with the new token

### 6.5: Verify Secrets Removed

```bash
# Search git history for the secret
git log -S "YOUR_SECRET_HERE" --all

# If this returns results, the secret is still present
```

---

## 7. Inspecting Logs and Debugging

### 7.1: Server Logs

The server writes logs to console and files:

**View in real-time:**
```bash
npm start
# Watch console output
```

**Log Files:**

| File | Purpose |
|------|---------|
| `tasks-log.json` | All incoming task requests |
| `last-notify.json` | Last successful notification |
| `last-error.log` | Last error encountered |
| `notify-failure.json` | Created when all retries fail |

### 7.2: View Log Files

**Windows PowerShell:**
```powershell
# Pretty-print JSON
Get-Content tasks-log.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# View last error
Get-Content last-error.log
```

**Linux/Mac:**
```bash
# Pretty-print JSON
cat tasks-log.json | jq .

# View last error
cat last-error.log
```

### 7.3: Debug Common Issues

**"Invalid secret" error:**
- Verify `WORKER_SECRET` in `.env` matches request
- Check for extra spaces or newlines
- Restart server after changing `.env`

**"GITHUB_TOKEN not set" error:**
- Verify `.env` file exists in `server/` directory
- Check environment variable: `echo $env:GITHUB_TOKEN` (PowerShell) or `echo $GITHUB_TOKEN` (bash)
- Restart server after setting variables

**Repository creation fails:**
```bash
# Test GitHub authentication
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

**Pages not enabling:**
```bash
# Check Pages API
gh api repos/USERNAME/REPO/pages
```

### 7.4: Re-run Notification

If notification failed, you can retry manually:

```bash
node scripts/notify_evaluator.js https://example.com/notify notify-failure.json
```

---

## 8. Running Playwright Tests

### 8.1: Install Playwright Browsers

First time only:
```bash
cd server
npx playwright install chromium
```

Or install all dependencies:
```bash
npx playwright install --with-deps
```

### 8.2: Run Tests

**Run all tests:**
```bash
npm test
```

**Run in headed mode (see browser):**
```bash
npm run test:headed
```

**Run specific test file:**
```bash
npx playwright test tests/playwright/tests.spec.js
```

### 8.3: Test Against Live Pages URL

```bash
PAGES_URL=https://username.github.io/repo-name/ npm test
```

**Windows PowerShell:**
```powershell
$env:PAGES_URL="https://username.github.io/repo-name/"
npm test
```

### 8.4: View Test Report

After running tests:
```bash
npx playwright show-report
```

This opens an HTML report in your browser.

### 8.5: Debug Tests

```bash
# Run with debugger
npx playwright test --debug

# Run specific test
npx playwright test --grep "page loads successfully"

# Generate trace
npx playwright test --trace on
```

---

## 9. Feedback and Round 2 Updates

### 9.1: Submitting Feedback to Instructor

**Email Template:**
```
Subject: LLM Code Deployment - Task [TASK_NAME] - Round [1/2]

Instructor,

I have completed [Round 1 / Round 2] for task: [TASK_NAME]

Repository: https://github.com/username/repo-name
Pages URL: https://username.github.io/repo-name/
Commit SHA: abc123def456...

Status: [Success / Partial / Failed]

Issues encountered:
- [List any issues]

Logs attached: tasks-log.json, last-notify.json

Thank you,
[Your Name]
```

### 9.2: Preparing for Round 2

Round 2 requests update the existing repository with new commits.

**What to expect:**
1. Same `task` field but different `brief`
2. `round: 2` in the request
3. New `nonce` value
4. Server creates new commit on existing repo
5. Pages URL remains the same

### 9.3: Sending Round 2 Request

**Manual curl:**
```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "secret": "my-super-secret-key-12345",
    "task": "test-task-123",
    "round": 2,
    "nonce": "test-nonce-round2",
    "brief": "Update the calculator to support multiple currencies",
    "checks": ["Supports USD and EUR"],
    "evaluation_url": "http://localhost:3000/test-evaluator",
    "attachments": []
  }'
```

### 9.4: Verify Round 2 Changes

1. Check repository for new commit
2. Verify Pages URL updated (may take 2-5 minutes)
3. Run Playwright tests to validate changes
4. Check notification was sent successfully

---

## Appendix: Quick Reference

### Essential Commands

```bash
# Start server
npm start

# Run tests
npm test

# Simulate request (Windows)
.\scripts\simulate_request.ps1

# Simulate request (Linux/Mac)
bash scripts/simulate_request.sh

# Check Pages ready
node scripts/check_pages_ready.js https://username.github.io/repo/

# View logs
cat tasks-log.json | jq .
```

### File Locations

- Environment variables: `server/.env`
- Request logs: `server/tasks-log.json`
- Notification logs: `server/last-notify.json`
- Error logs: `server/last-error.log`
- Test results: `server/playwright-report/`

### Support Resources

- GitHub Docs: [docs.github.com](https://docs.github.com)
- GitHub CLI: [cli.github.com](https://cli.github.com)
- Playwright Docs: [playwright.dev](https://playwright.dev)
- Node.js Docs: [nodejs.org/docs](https://nodejs.org/docs)

---

**Need Help?**

1. Check server logs: `tasks-log.json`, `last-error.log`
2. Review GitHub repository Settings > Pages
3. Test authentication: `gh auth status`
4. Contact instructor with logs and repository URL

---

*Last Updated: October 15, 2025*
