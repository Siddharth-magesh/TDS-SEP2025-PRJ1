# 🚀 Getting Started - Quick Guide

**Welcome to the LLM Code Deployment Server!**

This is your 5-minute quick start guide. For detailed instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Get GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`, `public_repo`
4. Click "Generate token"
5. **Copy the token** (starts with `ghp_`)

### Step 3: Configure Environment

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
notepad .env
```

**Linux/Mac:**
```bash
cp .env.example .env
nano .env
```

**Edit these values:**
```env
WORKER_SECRET=choose-a-secret-password-here
GITHUB_TOKEN=ghp_paste_your_token_here
GITHUB_USER_OR_ORG=your-github-username
```

### Step 4: Start Server

```bash
npm start
```

You should see:
```
[2025-10-15T12:00:00.000Z] Server running on port 3000
```

### Step 5: Test It!

**Windows:**
```powershell
.\scripts\simulate_request.ps1
```

**Linux/Mac:**
```bash
bash scripts/simulate_request.sh
```

---

## ✅ What Should Happen

1. Server receives your request
2. Generates a simple web app
3. Creates a new GitHub repository
4. Enables GitHub Pages
5. Waits for Pages to be ready
6. Notifies the test evaluator

**Check the logs:**
```bash
# View tasks
cat tasks-log.json

# View last notification
cat last-notify.json
```

---

## 🐛 Something Not Working?

### "Missing environment variables" warning

→ Did you edit `.env` file? Make sure it's in the `server/` directory.

### "Invalid secret" error

→ Check that `WORKER_SECRET` in `.env` matches the one in the request.

### "GITHUB_TOKEN not set"

→ Make sure you copied your GitHub token into `.env` file.

### Server won't start

→ Check Node.js version: `node --version` (need 18+)

---

## 📚 Next Steps

- **Read detailed docs:** [INSTRUCTIONS.md](./INSTRUCTIONS.md)
- **Learn the API:** [README.md](./README.md#api-endpoint)
- **Run tests:** `npm test`
- **See future plans:** [TODOS.md](./TODOS.md)

---

## 🆘 Need Help?

1. Check [INSTRUCTIONS.md](./INSTRUCTIONS.md) for step-by-step guide
2. Look at logs: `tasks-log.json`, `last-error.log`
3. Open an issue on GitHub

---

**Happy Deploying! 🎉**
