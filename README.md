# LLM Code Deployment Project

**TDS-SEP2025-PRJ1** - Automated code generation and deployment system

## Overview

This project implements a complete production-ready HTTP service that:

- Accepts task specifications via JSON POST requests
- Generates single-page applications using template-based logic (with hooks for LLM integration)
- Creates public GitHub repositories automatically
- Enables GitHub Pages and waits for deployment readiness
- Notifies evaluation endpoints with exponential backoff retry logic
- Includes comprehensive security measures to prevent secret leakage
- Supports Round 1 and Round 2 task iterations

## Quick Start

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your GitHub credentials

# Start server
npm start

# Test with simulation (Windows)
.\scripts\simulate_request.ps1
```

## Project Structure

```
TDS-SEP2025-PRJ1/
├── LICENSE                      # MIT License
├── README.md                    # This file
└── server/                      # Main application
    ├── src/
    │   ├── index.js            # Express HTTP server
    │   ├── handlers/
    │   │   ├── handleTask.js   # Main orchestration logic
    │   │   └── verifySecret.js # Authentication
    │   └── utils/
    │       ├── llmGenerator.js # Template-based app generator
    │       ├── githubHelper.js # GitHub API wrapper
    │       ├── notifier.js     # Retry logic for notifications
    │       ├── pagesChecker.js # Polls Pages URL for readiness
    │       └── safeGitUtils.js # Secret detection and prevention
    ├── scripts/
    │   ├── generate_app.js     # Standalone app generator
    │   ├── create_repo_and_push.js
    │   ├── notify_evaluator.js
    │   ├── check_pages_ready.js
    │   ├── simulate_request.sh # Bash test script
    │   └── simulate_request.ps1 # PowerShell test script
    ├── tests/
    │   └── playwright/
    │       └── tests.spec.js   # E2E tests
    ├── .github/workflows/
    │   └── deploy.yml          # GitHub Actions CI/CD
    ├── package.json
    ├── .env.example
    ├── README.md               # Server documentation
    ├── INSTRUCTIONS.md         # Step-by-step setup guide
    └── TODOS.md                # Future improvements
```

## Key Features

### 🚀 Automatic Deployment Pipeline

1. **Receive Task** → Validate secret and parse request
2. **Generate Code** → Create SPA from template
3. **Create Repo** → Push to GitHub with MIT license
4. **Enable Pages** → Configure GitHub Pages automatically
5. **Wait for Ready** → Poll until HTTP 200 (9 min timeout)
6. **Notify** → POST results with exponential backoff

### 🔒 Security Features

- Secret verification on all requests
- Pre-commit secret scanning
- Automatic secret redaction
- No credentials in logs
- Environment-based configuration

### 📦 Supported Templates

1. **Sum of Sales Calculator** - CSV data aggregation
2. **Markdown to HTML Converter** - Real-time rendering
3. **GitHub User Creation Date** - API integration example
4. **CAPTCHA Solver** - OCR placeholder
5. **Generic Template** - Fallback for any task

### 🧪 Testing Infrastructure

- Playwright E2E tests
- Template-specific validation
- Repository structure checks
- GitHub Actions integration
- Local test utilities

## Documentation

| Document | Purpose |
|----------|---------|
| [`server/README.md`](./server/README.md) | API reference, architecture, troubleshooting |
| [`server/INSTRUCTIONS.md`](./server/INSTRUCTIONS.md) | **Step-by-step setup guide** (start here!) |
| [`server/TODOS.md`](./server/TODOS.md) | Future improvements and enhancement ideas |

## Prerequisites

- **Node.js** 18.x or higher
- **GitHub Account** with Personal Access Token
- **Git** (optional, for fallback operations)
- **GitHub CLI** (optional, for manual commands)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WORKER_SECRET` | ✅ Yes | Authentication secret for task requests |
| `GITHUB_TOKEN` | ✅ Yes | GitHub Personal Access Token (PAT) |
| `GITHUB_USER_OR_ORG` | ✅ Yes | Your GitHub username |
| `PORT` | No | HTTP server port (default: 3000) |

## Usage Example

### API Request

```bash
POST http://localhost:3000/task
Content-Type: application/json

{
  "email": "student@example.com",
  "secret": "your-worker-secret",
  "task": "sum-of-sales-abc123",
  "round": 1,
  "nonce": "unique-nonce",
  "brief": "Create a calculator that sums sales from CSV data",
  "checks": [
    "Repo has MIT license",
    "Page displays CSV input",
    "Page calculates sum correctly"
  ],
  "evaluation_url": "https://evaluator.example.com/notify",
  "attachments": []
}
```

### Response

```json
{
  "status": "accepted",
  "task": "sum-of-sales-abc123",
  "round": 1,
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

### Evaluation Notification (Async)

```json
{
  "email": "student@example.com",
  "task": "sum-of-sales-abc123",
  "round": 1,
  "nonce": "unique-nonce",
  "repo_url": "https://github.com/username/sum-of-sales-abc123-abc",
  "commit_sha": "a1b2c3d4e5f6...",
  "pages_url": "https://username.github.io/sum-of-sales-abc123-abc/",
  "status": "success",
  "timestamp": "2025-10-15T12:05:00.000Z"
}
```

## Development

### Run Locally

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### Run Tests

```bash
npm test
```

### Simulate Request

**Windows:**
```powershell
.\scripts\simulate_request.ps1
```

**Linux/Mac:**
```bash
bash scripts/simulate_request.sh
```

## Deployment

### Option 1: Traditional Server

Deploy to any Node.js hosting (AWS EC2, DigitalOcean, Heroku, etc.):

```bash
# On server
git clone https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1.git
cd TDS-SEP2025-PRJ1/server
npm install --production
# Set environment variables
npm start
```

### Option 2: Docker

```bash
cd server
docker build -t llm-deployment-server .
docker run -p 3000:3000 \
  -e WORKER_SECRET=your-secret \
  -e GITHUB_TOKEN=your-token \
  -e GITHUB_USER_OR_ORG=your-username \
  llm-deployment-server
```

### Option 3: Serverless (Future)

See [`TODOS.md`](./server/TODOS.md) for serverless deployment options.

## Troubleshooting

### Common Issues

**"Invalid secret" error**
- Verify `WORKER_SECRET` matches in `.env` and request
- Check for extra whitespace or newlines
- Restart server after changing `.env`

**Repository creation fails**
- Verify GitHub token has `repo` and `workflow` scopes
- Check token hasn't expired
- Ensure repository name is unique

**Pages not ready after 9 minutes**
- Check repository is public (not private)
- Verify `index.html` exists in root
- Check GitHub Status: https://www.githubstatus.com/

For detailed troubleshooting, see [`server/INSTRUCTIONS.md`](./server/INSTRUCTIONS.md#7-inspecting-logs-and-debugging).

## Security

### Important Notes

- **Never commit** `.env` file
- **Never hardcode** tokens in source code
- **Always use** environment variables
- **Revoke tokens** immediately if compromised
- **Review logs** before sharing

See [`server/INSTRUCTIONS.md#6`](./server/INSTRUCTIONS.md#6-removing-secrets-from-git-history) for secret removal steps.

## Contributing

This is a student project, but improvements are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

See [`server/TODOS.md`](./server/TODOS.md) for improvement ideas.

## License

MIT License - See [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Built for TDS-SEP2025 course
- Uses GitHub API via Octokit
- Testing with Playwright
- Template inspiration from various open-source projects

## Support

- **Documentation:** See [`server/INSTRUCTIONS.md`](./server/INSTRUCTIONS.md)
- **Issues:** Check logs in `server/tasks-log.json`
- **API Docs:** See [`server/README.md`](./server/README.md)
- **Community:** Open an issue on GitHub

---

**Project Status:** ✅ Complete and ready for use

**Last Updated:** October 15, 2025

**Repository:** https://github.com/Siddharth-magesh/TDS-SEP2025-PRJ1
