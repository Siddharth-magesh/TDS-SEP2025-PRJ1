# Environment Setup Troubleshooting

## Current Issue

Your server is running but GitHub authentication is failing because:
- ❌ `GITHUB_TOKEN` environment variable is not set
- ❌ `GITHUB_USER_OR_ORG` environment variable is not set

## Quick Fix (Choose One Method)

### Method 1: Create .env File (Recommended)

**Step 1: Check if .env exists**
```powershell
# Windows PowerShell
Test-Path .env
```

**Step 2: Create .env from template**
```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

**Step 3: Edit .env file**
```powershell
notepad .env
```

**Step 4: Fill in your values**
```env
PORT=3000
WORKER_SECRET=your-secret-key-here

# IMPORTANT: Replace these with your actual values!
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_USER_OR_ORG=Siddharth-magesh
```

**Step 5: Restart the server**
```powershell
# Stop current server (Ctrl+C)
# Then restart:
npm start
```

---

### Method 2: Set Environment Variables (Session-Only)

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="ghp_your_actual_token_here"
$env:GITHUB_USER_OR_ORG="Siddharth-magesh"
$env:WORKER_SECRET="your-secret-key-here"

# Then start server:
npm start
```

**Bash/Git Bash:**
```bash
export GITHUB_TOKEN="ghp_your_actual_token_here"
export GITHUB_USER_OR_ORG="Siddharth-magesh"
export WORKER_SECRET="your-secret-key-here"

# Then start server:
npm start
```

---

## How to Get GitHub Token

### If you DON'T have a token yet:

1. **Go to:** https://github.com/settings/tokens/new
2. **Note:** "LLM Deployment Server"
3. **Expiration:** 90 days (or No expiration)
4. **Select scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `public_repo` (Access public repositories)
5. **Click:** "Generate token"
6. **Copy the token** (starts with `ghp_`) - you won't see it again!

### If you HAVE a token but forgot it:

You'll need to create a new one (tokens can't be viewed after creation).

---

## Verify Setup

### Test 1: Check environment variables are loaded

**Windows PowerShell:**
```powershell
echo $env:GITHUB_TOKEN
echo $env:GITHUB_USER_OR_ORG
```

**Bash:**
```bash
echo $GITHUB_TOKEN
echo $GITHUB_USER_OR_ORG
```

You should see your actual values (not the placeholder text).

### Test 2: Test GitHub authentication

```powershell
# Test Octokit authentication
curl -H "Authorization: token $env:GITHUB_TOKEN" https://api.github.com/user
```

If successful, you'll see your GitHub user info in JSON format.

### Test 3: Run simulation again

```powershell
.\scripts\simulate_request.ps1
```

This time it should create a real repository!

---

## Common Mistakes

### ❌ Token has wrong format
- Token should start with `ghp_` (classic PAT)
- Should be 40+ characters long
- No spaces or quotes in the token itself

### ❌ Token doesn't have right scopes
- Go back to https://github.com/settings/tokens
- Click on your token
- Verify `repo`, `workflow`, `public_repo` are checked

### ❌ Token expired
- Check expiration date in GitHub settings
- Generate new token if expired

### ❌ .env file not in correct location
- Must be in `server/.env` (not root directory)
- Check: `ls -la` to see if .env exists

### ❌ Server not restarted after changing .env
- Must stop server (Ctrl+C) and restart (`npm start`)
- Environment variables are only loaded on startup

---

## Alternative: Use gh CLI

If you prefer to use GitHub CLI instead:

**Step 1: Install gh CLI**
- Windows: `winget install GitHub.cli`
- Or download from: https://cli.github.com/

**Step 2: Login**
```bash
gh auth login
```

Follow the prompts to authenticate.

**Step 3: Verify**
```bash
gh auth status
```

**Note:** The server will automatically use `gh` CLI if Octokit fails, but you still need to set `GITHUB_USER_OR_ORG` in `.env`.

---

## Next Steps After Fixing

1. ✅ Set environment variables (Method 1 or 2)
2. ✅ Restart server
3. ✅ Run simulation: `.\scripts\simulate_request.ps1`
4. ✅ Check logs: `cat last-notify.json`
5. ✅ View your new repository on GitHub!

---

## Still Having Issues?

Check the detailed guide: [INSTRUCTIONS.md](./INSTRUCTIONS.md)

Or contact support with:
- Contents of `last-error.log`
- Output of `echo $env:GITHUB_TOKEN` (first 10 characters only!)
- Your GitHub username
