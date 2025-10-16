# LLM Code Deployment Server

A production-ready HTTP service that automatically generates single-page applications based on task briefs, deploys them to GitHub Pages, and notifies evaluators with exponential backoff retry logic.

## Overview

This server:
- Accepts JSON POST requests with task specifications
- Generates deterministic single-page applications using template-based logic
- Creates public GitHub repositories with generated code
- Enables GitHub Pages automatically
- Waits for Pages deployment to be ready (HTTP 200)
- Notifies evaluation endpoints with retry logic (exponential backoff)
- Includes security checks to prevent committing secrets
- Supports Round 1 and Round 2 task updates

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- GitHub Personal Access Token (PAT) with `repo`, `workflow`, and `public_repo` scopes
- (Optional) GitHub CLI (`gh`) for fallback operations

### Installation

```bash
cd server
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and set your credentials:
```env
PORT=3000
WORKER_SECRET=your-secret-key-here
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
GITHUB_USER_OR_ORG=your-github-username
```

### Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoint

### POST /task

Accepts a task request and begins async processing.

**Request Body:**
```json
{
  "email": "student@example.com",
  "secret": "your-worker-secret",
  "task": "captcha-solver-abc123",
  "round": 1,
  "nonce": "unique-nonce",
  "brief": "Create a captcha solver that handles ?url=... Default to attached sample.",
  "checks": [
    "Repo has MIT license",
    "README.md is professional",
    "Page displays captcha URL passed at ?url=...",
    "Page displays solved captcha text within 15 seconds"
  ],
  "evaluation_url": "https://example.com/notify",
  "attachments": [
    {
      "name": "sample.png",
      "url": "data:image/png;base64,iVBORw0KG..."
    }
  ]
}
```

**Response (immediate):**
```json
{
  "status": "accepted",
  "task": "captcha-solver-abc123",
  "round": 1,
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

**Evaluation Notification (sent asynchronously):**
```json
{
  "email": "student@example.com",
  "task": "captcha-solver-abc123",
  "round": 1,
  "nonce": "unique-nonce",
  "repo_url": "https://github.com/username/repo",
  "commit_sha": "abc123def456...",
  "pages_url": "https://username.github.io/repo/",
  "status": "success",
  "timestamp": "2025-10-15T12:05:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

## Supported Templates

The LLM generator recognizes these task patterns:

1. **Sum of Sales** - CSV data calculator
   - Detects: "sum" + "sales" in brief
   - Features: CSV input, calculation button, total display

2. **Markdown to HTML** - Real-time converter
   - Detects: "markdown" + "html" in brief
   - Features: Side-by-side editor, live preview

3. **GitHub User Created** - Account age checker
   - Detects: "github" + "user" in brief
   - Features: Username input, API integration, date display

4. **CAPTCHA Solver** - OCR placeholder
   - Detects: "captcha" in brief
   - Features: Image display, simulated OCR (TODO: integrate real OCR)

5. **Generic Template** - Fallback for other tasks
   - Features: URL parameter handling, asset display

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP server port (default: 3000) |
| `WORKER_SECRET` | **Yes** | Secret for authenticating task requests |
| `GITHUB_TOKEN` | **Yes** | GitHub Personal Access Token |
| `GITHUB_USER_OR_ORG` | **Yes** | GitHub username or organization |
| `TEST_EVALUATION_URL` | No | Local test evaluator endpoint |

## Testing

### Local Test Request

**Windows PowerShell:**
```powershell
.\scripts\simulate_request.ps1
```

**Linux/Mac:**
```bash
bash scripts/simulate_request.sh
```

### Run Playwright Tests

```bash
npm test
```

### Manual Script Testing

```bash
# Generate app from brief
node scripts/generate_app.js "Create a sum of sales calculator"

# Create repo and push (requires files directory)
node scripts/create_repo_and_push.js my-test-repo ./generated-output

# Check if Pages URL is ready
node scripts/check_pages_ready.js https://username.github.io/repo/ 300

# Notify evaluator
node scripts/notify_evaluator.js https://example.com/notify payload.json
```

## Logging and Debugging

### Log Files

- `tasks-log.json` - All incoming task requests (secrets redacted)
- `last-notify.json` - Last successful notification
- `last-error.log` - Last error encountered
- `notify-failure.json` - Created when all notification retries fail

### View Logs

**Windows:**
```powershell
Get-Content tasks-log.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Linux/Mac:**
```bash
cat tasks-log.json | jq .
```

## Security Features

1. **Secret Verification** - All requests validated against `WORKER_SECRET`
2. **Secret Scanning** - Pre-commit checks for hardcoded tokens
3. **Secret Redaction** - Automatic removal if detected in generated files
4. **HTTPS Only** - External APIs called over secure connections
5. **No Token Logging** - Credentials never written to logs

## Troubleshooting

### Server won't start
- Check Node.js version: `node --version` (need 18+)
- Verify environment variables are set
- Check port availability: `netstat -ano | findstr :3000` (Windows)

### Repository creation fails
- Verify GitHub token has correct scopes
- Check token hasn't expired
- Ensure repository name is unique
- Try fallback to `gh` CLI: `gh --version`

### GitHub Pages not ready
- Pages can take 5-10 minutes on first deploy
- Check repository Settings > Pages in GitHub UI
- Verify repository is public
- Check DNS propagation: `nslookup username.github.io`

### Notification fails
- Verify evaluation_url is accessible
- Check network connectivity
- Review `notify-failure.json` for error details
- Test endpoint manually: `curl -X POST <url> -d '{"test": true}'`

## Architecture

```
server/
├── src/
│   ├── index.js              # Express server
│   ├── handlers/
│   │   ├── handleTask.js     # Main orchestration
│   │   └── verifySecret.js   # Authentication
│   └── utils/
│       ├── llmGenerator.js   # Template engine
│       ├── githubHelper.js   # GitHub API wrapper
│       ├── notifier.js       # Retry logic
│       ├── pagesChecker.js   # Polling logic
│       └── safeGitUtils.js   # Security checks
├── scripts/                  # Standalone utilities
├── tests/                    # Playwright tests
└── .github/workflows/        # CI/CD
```

## License

MIT License - See LICENSE file

## Support

For detailed setup instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

For future improvements, see [TODOS.md](./TODOS.md).
