# Environment Setup Verification Script
# Run this to check if your environment is configured correctly

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Environment Setup Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Node.js version
Write-Host "1. Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -ge 18) {
        Write-Host "   ✓ Node.js $nodeVersion (OK)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Node.js $nodeVersion (Need 18+)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ✗ Node.js not found" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 2: .env file exists
Write-Host "2. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ .env file NOT found" -ForegroundColor Red
    Write-Host "   → Run: Copy-Item .env.example .env" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check 3: Load .env and check variables
Write-Host "3. Checking environment variables..." -ForegroundColor Yellow

# Try to load from .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Check WORKER_SECRET
if ($env:WORKER_SECRET -and $env:WORKER_SECRET -ne "your-secret-key-here") {
    Write-Host "   ✓ WORKER_SECRET is set" -ForegroundColor Green
} else {
    Write-Host "   ✗ WORKER_SECRET not configured" -ForegroundColor Red
    Write-Host "   → Edit .env and set WORKER_SECRET" -ForegroundColor Gray
    $allGood = $false
}

# Check GITHUB_TOKEN
if ($env:GITHUB_TOKEN -and $env:GITHUB_TOKEN -ne "ghp_your_github_personal_access_token_here") {
    $tokenPrefix = $env:GITHUB_TOKEN.Substring(0, [Math]::Min(10, $env:GITHUB_TOKEN.Length))
    Write-Host "   ✓ GITHUB_TOKEN is set ($tokenPrefix...)" -ForegroundColor Green
    
    # Validate token format
    if ($env:GITHUB_TOKEN -match "^ghp_[A-Za-z0-9]{36}$") {
        Write-Host "   ✓ Token format looks correct" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Token format may be invalid (should be ghp_...)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ GITHUB_TOKEN not configured" -ForegroundColor Red
    Write-Host "   → Get token from: https://github.com/settings/tokens/new" -ForegroundColor Gray
    $allGood = $false
}

# Check GITHUB_USER_OR_ORG
if ($env:GITHUB_USER_OR_ORG -and $env:GITHUB_USER_OR_ORG -ne "your-github-username") {
    Write-Host "   ✓ GITHUB_USER_OR_ORG is set: $env:GITHUB_USER_OR_ORG" -ForegroundColor Green
} else {
    Write-Host "   ✗ GITHUB_USER_OR_ORG not configured" -ForegroundColor Red
    Write-Host "   → Edit .env and set your GitHub username" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check 4: Test GitHub API authentication
Write-Host "4. Testing GitHub API authentication..." -ForegroundColor Yellow
if ($env:GITHUB_TOKEN -and $env:GITHUB_TOKEN -ne "ghp_your_github_personal_access_token_here") {
    try {
        $headers = @{
            "Authorization" = "token $env:GITHUB_TOKEN"
            "User-Agent" = "LLM-Deployment-Server"
        }
        $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GitHub authentication successful!" -ForegroundColor Green
        Write-Host "   → Authenticated as: $($response.login)" -ForegroundColor Gray
        
        # Check if username matches
        if ($env:GITHUB_USER_OR_ORG -eq $response.login) {
            Write-Host "   ✓ Username matches GITHUB_USER_OR_ORG" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Username mismatch: .env has '$env:GITHUB_USER_OR_ORG' but GitHub says '$($response.login)'" -ForegroundColor Yellow
            Write-Host "   → Update GITHUB_USER_OR_ORG to: $($response.login)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ✗ GitHub authentication FAILED" -ForegroundColor Red
        Write-Host "   → Error: $($_.Exception.Message)" -ForegroundColor Gray
        $allGood = $false
    }
} else {
    Write-Host "   ⊘ Skipped (GITHUB_TOKEN not set)" -ForegroundColor Gray
}
Write-Host ""

# Check 5: node_modules exists
Write-Host "5. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ Dependencies not installed" -ForegroundColor Red
    Write-Host "   → Run: npm install" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check 6: gh CLI (optional)
Write-Host "6. Checking gh CLI (optional)..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "   ✓ gh CLI installed: $ghVersion" -ForegroundColor Green
    
    # Check gh auth status
    $ghAuthStatus = gh auth status 2>&1
    if ($ghAuthStatus -match "Logged in") {
        Write-Host "   ✓ gh CLI authenticated" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ gh CLI not authenticated (run: gh auth login)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⊘ gh CLI not installed (optional fallback)" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You're ready to start the server:" -ForegroundColor Green
    Write-Host "  npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "Then test with:" -ForegroundColor Green
    Write-Host "  .\scripts\simulate_request.ps1" -ForegroundColor White
} else {
    Write-Host "✗ SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick fix guide:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env: Copy-Item .env.example .env" -ForegroundColor White
    Write-Host "2. Edit .env: notepad .env" -ForegroundColor White
    Write-Host "3. Get GitHub token: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "4. Run this script again: .\scripts\verify-setup.ps1" -ForegroundColor White
}
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Help message
Write-Host "Need help? Check:" -ForegroundColor Cyan
Write-Host "  TROUBLESHOOTING.md - Common issues and solutions" -ForegroundColor Gray
Write-Host "  INSTRUCTIONS.md    - Detailed setup guide" -ForegroundColor Gray
Write-Host "  GETTING_STARTED.md - Quick start guide" -ForegroundColor Gray
