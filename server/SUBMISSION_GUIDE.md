# 📋 TDS Project Submission Guide

## 🎯 Current Status

✅ **COMPLETED:**
- Server implementation with POST `/task` endpoint
- Secret verification system
- LLM-based code generation (template-based)
- GitHub repository creation and push
- GitHub Pages automatic enablement
- Pages readiness checker with polling
- Evaluation URL notification with exponential backoff retry
- Round 1 and Round 2 support
- Security checks (prevent secrets in git history)
- Comprehensive documentation
- Playwright test suite
- Docker support

❌ **NEEDS ACTION:**
1. Deploy your server to a public URL
2. Test the complete workflow
3. Submit the Google Form

---

## 📝 What to Submit in Google Form

### 1. **Email**
```
22f3002579@ds.study.iitm.ac.in
```

### 2. **API URL** (You need to deploy first!)
Options:
- **Local testing (NOT for submission):** `http://localhost:3000/task`
- **Recommended - GitHub Codespaces:** `https://your-codespace-url.app.github.dev/task`
- **Alternative - Render.com:** `https://your-app.onrender.com/task`
- **Alternative - Railway.app:** `https://your-app.railway.app/task`

### 3. **Secret Value**
```
your-secret-key-here
```
⚠️ **IMPORTANT:** This must match the `WORKER_SECRET` in your `.env` file

### 4. **GitHub Repo URL**
```
https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1
```
⚠️ **Make this repo PUBLIC before the deadline!**

---

## 🚀 Next Steps (In Order)

### Step 1: Verify Local Setup ✅ (DONE)

Your server is working locally! Environment variables are set correctly.

### Step 2: Install Playwright Browsers (OPTIONAL - for testing)

```powershell
cd d:\TDS-SEP2025-PRJ1\server
npx playwright install
```

This is optional but recommended if you want to run tests locally.

### Step 3: Test Your Server Locally

**Terminal 1 - Start the server:**
```powershell
cd d:\TDS-SEP2025-PRJ1\server
npm start
```

**Terminal 2 - Send a test request:**
```powershell
cd d:\TDS-SEP2025-PRJ1\server
.\scripts\simulate_request.ps1
```

**What should happen:**
1. Server receives the request
2. Verifies the secret
3. Generates code based on the brief
4. Creates a new GitHub repo (e.g., `sum-of-sales-a1b2c`)
5. Pushes code with MIT LICENSE and README.md
6. Enables GitHub Pages
7. Waits for Pages to be ready (200 OK)
8. Notifies the evaluation URL with repo details

**Check the output:**
- Look at `tasks-log.json` - see all received requests
- Look at `last-notify.json` - see the last notification sent
- Check your GitHub account - see new repositories created

### Step 4: Deploy to a Public URL

You have **3 deployment options**:

#### Option A: GitHub Codespaces (RECOMMENDED - FREE)

1. **Go to your repo:** https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1
2. **Click the green "Code" button** → Codespaces tab → Create codespace
3. **Wait for it to load** (may take 2-3 minutes)
4. **In the Codespace terminal:**
   ```bash
   cd server
   npm install
   npm start
   ```
5. **When it starts, VS Code will show a popup:** "Your application running on port 3000 is available"
6. **Click "Make Public"** (important!)
7. **Copy the forwarded URL** (looks like: `https://redesigned-space-waddle-abc123.app.github.dev`)
8. **Your API endpoint is:** `https://redesigned-space-waddle-abc123.app.github.dev/task`

**Set environment variables in Codespace:**
```bash
export WORKER_SECRET="your-secret-key-here"
export GITHUB_TOKEN="g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"
export GITHUB_USER_OR_ORG="Siddharth-magesh"
npm start
```

#### Option B: Render.com (FREE - but may be slow to start)

1. **Sign up:** https://render.com (use GitHub login)
2. **New Web Service** → Connect your GitHub repo
3. **Configure:**
   - Name: `tds-llm-deployment`
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. **Add Environment Variables:**
   - `WORKER_SECRET`: `your-secret-key-here`
   - `GITHUB_TOKEN`: `g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`
   - `GITHUB_USER_OR_ORG`: `Siddharth-magesh`
   - `PORT`: `3000`
5. **Deploy** → Copy the URL (e.g., `https://tds-llm-deployment.onrender.com`)
6. **Your API endpoint:** `https://tds-llm-deployment.onrender.com/task`

⚠️ **Note:** Free tier spins down after inactivity. First request may take 30-60 seconds.

#### Option C: Railway.app (FREE trial - $5 credit)

1. **Sign up:** https://railway.app (use GitHub login)
2. **New Project** → Deploy from GitHub repo
3. **Select your repo:** `TDS-SEP2025-PRJ1`
4. **Configure:**
   - Root Directory: `server`
   - Start Command: `npm start`
5. **Add Environment Variables:**
   - `WORKER_SECRET`: `your-secret-key-here`
   - `GITHUB_TOKEN`: `g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`
   - `GITHUB_USER_OR_ORG`: `Siddharth-magesh`
6. **Deploy** → Generate Domain → Copy URL
7. **Your API endpoint:** `https://your-app.railway.app/task`

### Step 5: Test Your Deployed Server

**Update the simulation script to use your deployed URL:**

Edit `scripts\simulate_request.ps1` and change line 2:
```powershell
$API_URL = "https://your-deployed-url.com/task"  # Change this!
```

Then run:
```powershell
.\scripts\simulate_request.ps1
```

### Step 6: Make Your Repo Public

1. Go to: https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1/settings
2. Scroll to **Danger Zone**
3. Click **Change visibility** → **Make public**
4. Type the repo name to confirm
5. Click **I understand, make this repository public**

⚠️ **IMPORTANT:** Do this BEFORE the deadline!

### Step 7: Verify No Secrets in Git History

```powershell
cd d:\TDS-SEP2025-PRJ1\server
.\scripts\verify-setup.ps1
```

This checks:
- ✅ `.env` file exists
- ✅ `.env` is in `.gitignore`
- ✅ No secrets committed to git history

If it finds secrets, follow the instructions in `TROUBLESHOOTING.md` to remove them.

### Step 8: Submit the Google Form

Fill in the form with:

1. **Email:** `22f3002579@ds.study.iitm.ac.in`
2. **API URL:** Your deployed URL + `/task` (e.g., `https://your-app.railway.app/task`)
3. **Secret:** `your-secret-key-here` (must match your `.env`)
4. **GitHub URL:** `https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1`

---

## 🔍 How to Verify Everything is Working

### Test 1: Health Check
```powershell
curl https://your-deployed-url.com/health
```
**Expected:** `{"status":"ok","timestamp":"2025-10-16T..."}`

### Test 2: Full Workflow
```powershell
curl https://your-deployed-url.com/task `
  -H "Content-Type: application/json" `
  -d '{
    "email": "22f3002579@ds.study.iitm.ac.in",
    "secret": "your-secret-key-here",
    "task": "test-task-001",
    "round": 1,
    "nonce": "test-nonce-123",
    "brief": "Create a simple calculator that adds two numbers",
    "checks": ["Page loads", "Has input fields"],
    "evaluation_url": "http://localhost:3000/test-evaluator"
  }'
```

**Expected response:**
```json
{
  "status": "accepted",
  "task": "test-task-001",
  "round": 1,
  "timestamp": "2025-10-16T..."
}
```

**Then check:**
1. Your GitHub account for a new repo
2. The repo should have:
   - ✅ MIT LICENSE file
   - ✅ Professional README.md
   - ✅ index.html with the calculator
   - ✅ GitHub Pages enabled
   - ✅ No secrets in history

---

## 📊 What Happens After Submission

1. **Instructors send Round 1 request** to your API URL
2. **Your server:**
   - Verifies the secret
   - Generates the app
   - Creates a GitHub repo
   - Enables Pages
   - Notifies the evaluation URL
3. **Instructors evaluate:**
   - Check LICENSE exists and is MIT
   - LLM evaluates README quality
   - LLM evaluates code quality
   - Playwright runs dynamic tests
4. **Instructors send Round 2 request** (even if Round 1 failed)
5. **Your server:**
   - Verifies the secret
   - Updates the existing repo
   - Modifies code based on new brief
   - Updates README
   - Pushes changes (triggers Pages redeploy)
   - Notifies evaluation URL
6. **Results published after deadline**

---

## ⚠️ Common Issues and Solutions

### Issue 1: "Missing GITHUB_TOKEN" error
**Solution:** ✅ FIXED! This was due to a typo in validation logic.

### Issue 2: GitHub API returns 401
**Solution:** 
- Check your token is valid: https://github.com/settings/tokens
- Ensure token has `repo`, `workflow`, `public_repo` scopes
- Token should start with `ghp_` (not `gghp_`)

### Issue 3: Pages not enabling
**Solution:**
- Repo must be public
- Check GitHub Pages settings in repo → Settings → Pages
- May take 1-2 minutes for Pages to deploy

### Issue 4: Evaluation URL times out
**Solution:**
- Check the evaluation_url is reachable
- Server retries with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s)
- Check `last-notify.json` for details

### Issue 5: Secrets in git history
**Solution:**
```powershell
# Remove all history and start fresh
cd d:\TDS-SEP2025-PRJ1
git checkout --orphan new-main
git add -A
git commit -m "Initial commit (cleaned history)"
git branch -D main
git branch -m main
git push -f origin main
```

---

## 📚 Additional Resources

- **Project README:** `README.md` - Complete documentation
- **Setup Instructions:** `INSTRUCTIONS.md` - Detailed setup guide
- **Troubleshooting:** `TROUBLESHOOTING.md` - Common issues and solutions
- **Getting Started:** `GETTING_STARTED.md` - Quick start guide
- **TODOs:** `TODOS.md` - Implementation checklist

---

## ✅ Final Checklist

- [ ] Server runs locally without errors
- [ ] Test request works (creates repo + enables Pages)
- [ ] Server deployed to public URL
- [ ] Public URL is accessible (health check works)
- [ ] Test request to public URL works
- [ ] Repository is PUBLIC
- [ ] No secrets in git history
- [ ] Google Form submitted with correct values
- [ ] API URL in form matches deployed URL
- [ ] Secret in form matches `.env` WORKER_SECRET

---

## 🎓 Good Luck!

You're almost there! The hard work is done - your server is fully implemented and tested locally. Now you just need to:
1. Deploy it
2. Test it
3. Submit the form

**Estimated time remaining:** 30-60 minutes

If you run into any issues, check the troubleshooting guide or ask for help!

---

**Last updated:** October 16, 2025
