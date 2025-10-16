# PowerShell script to simulate a task request (Windows version)

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating task request to $SERVER_URL/task"
Write-Host "Using secret: $($WORKER_SECRET.Substring(0, [Math]::Min(10, $WORKER_SECRET.Length)))..."
Write-Host ""

# Sample request payload
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = "student@example.com"
    secret = $WORKER_SECRET
    task = "test-task-$timestamp"
    round = 1
    nonce = "test-$timestamp"
    brief = "Create a simple sum of sales calculator that reads CSV data"
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "Page displays input for CSV data",
        "Page calculates sum correctly"
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
