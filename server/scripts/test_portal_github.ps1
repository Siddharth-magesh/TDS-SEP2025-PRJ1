# PowerShell script to simulate EXACT github-user-created task from portal specs

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating PORTAL-SPEC GITHUB-USER-CREATED task" -ForegroundColor Cyan
Write-Host "This matches the exact portal specifications"
Write-Host ""

# Generate seed
$seed = "TEST2025"

# Sample request payload matching portal specs
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = "student@example.com"
    secret = $WORKER_SECRET
    task = "github-user-created-$timestamp"
    round = 1
    nonce = "nonce-$timestamp"
    brief = "Publish a Bootstrap page with form id=`"github-user-$seed`" that fetches a GitHub username, optionally uses ?token=, and displays the account creation date in YYYY-MM-DD UTC inside #github-created-at."
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "document.querySelector('#github-user-$seed').tagName === 'FORM'",
        "document.querySelector('#github-created-at').textContent.includes('20')",
        "document.querySelector('script').textContent.includes('https://api.github.com/users/')"
    )
    evaluation_url = "$SERVER_URL/test-evaluator"
    attachments = @()
} | ConvertTo-Json -Depth 10

Write-Host "Expected Checks:" -ForegroundColor Yellow
Write-Host "  1. Form with id='github-user-$seed'" -ForegroundColor Gray
Write-Host "  2. Display creation date in #github-created-at" -ForegroundColor Gray
Write-Host "  3. Uses GitHub API (https://api.github.com/users/)" -ForegroundColor Gray
Write-Host "  4. Bootstrap loaded" -ForegroundColor Gray
Write-Host "  5. Supports optional ?token= parameter" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$SERVER_URL/task" `
        -Method Post `
        -ContentType "application/json" `
        -Body $payload
    
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    Write-Host "Request successful! Check server logs for progress." -ForegroundColor Green
    Write-Host ""
    Write-Host "After deployment, verify:" -ForegroundColor Cyan
    Write-Host "  - Form accepts GitHub username" -ForegroundColor Gray
    Write-Host "  - Fetches user data from GitHub API" -ForegroundColor Gray
    Write-Host "  - Displays creation date in YYYY-MM-DD format" -ForegroundColor Gray
    Write-Host "  - Bootstrap styling applied" -ForegroundColor Gray
    Write-Host "  - Try with: octocat, torvalds, gvanrossum" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
