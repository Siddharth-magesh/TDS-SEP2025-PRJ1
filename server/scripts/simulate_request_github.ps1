# PowerShell script to simulate a GitHub User Lookup task request

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating GITHUB USER LOOKUP task request to $SERVER_URL/task"
Write-Host "Using secret: $($WORKER_SECRET.Substring(0, [Math]::Min(10, $WORKER_SECRET.Length)))..."
Write-Host ""

# Sample request payload
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = "student@example.com"
    secret = $WORKER_SECRET
    task = "github-lookup-$timestamp"
    round = 1
    nonce = "test-$timestamp"
    brief = "Create a GitHub user lookup tool that fetches and displays user account creation date"
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "Page has username input field",
        "Page fetches GitHub user data",
        "Page displays account creation date",
        "Page handles API errors gracefully"
    )
    evaluation_url = "$SERVER_URL/test-evaluator"
    attachments = @()
} | ConvertTo-Json -Depth 10

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
    Write-Host "View tasks log: Get-Content tasks-log.json | ConvertFrom-Json"
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
