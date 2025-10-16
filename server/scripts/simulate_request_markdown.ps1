# PowerShell script to simulate a Markdown to HTML task request

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating MARKDOWN TO HTML task request to $SERVER_URL/task"
Write-Host "Using secret: $($WORKER_SECRET.Substring(0, [Math]::Min(10, $WORKER_SECRET.Length)))..."
Write-Host ""

# Sample Markdown content (base64 encoded)
$markdownContent = @"
# Hello World

This is a **test** markdown document.

## Features
- Lists
- **Bold** text
- *Italic* text

``````javascript
console.log('Hello, World!');
``````
"@

$markdownBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($markdownContent))

# Sample request payload
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = "student@example.com"
    secret = $WORKER_SECRET
    task = "markdown-test-$timestamp"
    round = 1
    nonce = "test-$timestamp"
    brief = "Create a Markdown to HTML converter that displays the rendered HTML"
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "Page has markdown input area",
        "Page converts markdown to HTML",
        "Page uses marked.js library",
        "Page has syntax highlighting"
    )
    evaluation_url = "$SERVER_URL/test-evaluator"
    attachments = @(
        @{
            name = "sample.md"
            url = "data:text/markdown;base64,$markdownBase64"
        }
    )
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
