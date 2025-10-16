# PowerShell script to simulate EXACT markdown-to-html task from portal specs

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating PORTAL-SPEC MARKDOWN-TO-HTML task" -ForegroundColor Cyan
Write-Host "This matches the exact portal specifications"
Write-Host ""

# Generate seed
$seed = "TEST2025"

# Sample Markdown content (base64 encoded)
$markdownContent = @"
# Hello World

This is a **test** markdown document with code highlighting.

## Code Example

``````javascript
function greet(name) {
  console.log('Hello, ' + name);
}
greet('World');
``````

## Features
- Lists work
- **Bold** text works
- *Italic* text works
- Code blocks with syntax highlighting
"@

$markdownBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($markdownContent))

# Sample request payload matching portal specs
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = "student@example.com"
    secret = $WORKER_SECRET
    task = "markdown-to-html-$timestamp"
    round = 1
    nonce = "nonce-$timestamp"
    brief = "Publish a static page that converts input.md from attachments to HTML with marked, renders it inside #markdown-output, and loads highlight.js for code blocks."
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "document.querySelector('script[src*=`"marked`"]') exists",
        "document.querySelector('script[src*=`"highlight.js`"]') exists",
        "document.querySelector('#markdown-output').innerHTML.includes('<h')"
    )
    evaluation_url = "$SERVER_URL/test-evaluator"
    attachments = @(
        @{
            name = "input.md"
            url = "data:text/markdown;base64,$markdownBase64"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Expected Checks:" -ForegroundColor Yellow
Write-Host "  1. marked.js library loaded" -ForegroundColor Gray
Write-Host "  2. highlight.js library loaded" -ForegroundColor Gray
Write-Host "  3. Markdown rendered as HTML in #markdown-output" -ForegroundColor Gray
Write-Host "  4. Output contains HTML heading tags" -ForegroundColor Gray
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
    Write-Host "  - marked.js loaded from CDN" -ForegroundColor Gray
    Write-Host "  - highlight.js loaded from CDN" -ForegroundColor Gray
    Write-Host "  - Markdown converted to HTML" -ForegroundColor Gray
    Write-Host "  - Code blocks have syntax highlighting" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
