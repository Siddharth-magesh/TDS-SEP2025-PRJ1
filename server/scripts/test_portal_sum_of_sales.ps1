# PowerShell script to simulate EXACT sum-of-sales task from portal specs

# Configuration
$SERVER_URL = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }
$WORKER_SECRET = if ($env:WORKER_SECRET) { $env:WORKER_SECRET } else { "your-secret-key-here" }

Write-Host "Simulating PORTAL-SPEC SUM-OF-SALES task" -ForegroundColor Cyan
Write-Host "This matches the exact portal specifications"
Write-Host ""

# Generate seed based on email and timestamp
$email = "student@example.com"
$seed = "TEST2025"

# Sample CSV data (base64 encoded)
$csvContent = @"
product,region,sales
Widget A,North,1250.50
Widget B,South,2340.75
Widget C,East,890.25
Widget A,West,1560.00
Widget B,North,3200.50
"@

$csvBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($csvContent))
$expectedTotal = 9242.00

# Sample request payload matching portal specs
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$payload = @{
    email = $email
    secret = $WORKER_SECRET
    task = "sum-of-sales-$timestamp"
    round = 1
    nonce = "nonce-$timestamp"
    brief = "Publish a single-page site that fetches data.csv from attachments, sums its sales column, sets the title to `"Sales Summary $seed`", displays the total inside #total-sales, and loads Bootstrap 5 from jsdelivr."
    checks = @(
        "Repo has MIT license",
        "README.md is professional",
        "document.title === 'Sales Summary $seed'",
        "document.querySelector('link[href*=`"bootstrap`"]') exists",
        "Math.abs(parseFloat(document.querySelector('#total-sales').textContent) - $expectedTotal) < 0.01"
    )
    evaluation_url = "$SERVER_URL/test-evaluator"
    attachments = @(
        @{
            name = "data.csv"
            url = "data:text/csv;base64,$csvBase64"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Expected Checks:" -ForegroundColor Yellow
Write-Host "  1. Title should be: 'Sales Summary $seed'" -ForegroundColor Gray
Write-Host "  2. Bootstrap 5 loaded from jsdelivr" -ForegroundColor Gray
Write-Host "  3. Total sales displayed in #total-sales: $expectedTotal" -ForegroundColor Gray
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
    Write-Host "  - Pages URL loads correctly" -ForegroundColor Gray
    Write-Host "  - CSV data is processed" -ForegroundColor Gray
    Write-Host "  - Total is calculated: $expectedTotal" -ForegroundColor Gray
    Write-Host "  - Bootstrap 5 is loaded" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
