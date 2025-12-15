#!/usr/bin/env pwsh

# Three Rivers Bank - Azure Setup Verification Script
# Verifies that all required components are properly configured

Write-Host "Three Rivers Bank - Azure Setup Verification" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

$errors = @()

# Check files exist
$requiredFiles = @(
    "azure.yaml",
    "terraform-main.tf", 
    "terraform-variables.tf",
    "terraform-outputs.tf",
    "azd-config.json",
    "docker-compose.yml",
    "setup-azure-deployment.ps1",
    ".github/workflows/azure-azd-deploy.yml",
    "README-AZURE-DEPLOYMENT.md"
)

Write-Host "Checking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        $errors += "Missing file: $file"
    }
}

Write-Host ""

# Check Azure CLI
Write-Host "Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az --version 2>$null | Select-String "azure-cli"
    if ($azVersion) {
        Write-Host "✓ Azure CLI: $($azVersion.Line.Trim())" -ForegroundColor Green
    }
    
    # Check if logged in
    $account = az account show 2>$null | ConvertFrom-Json
    if ($account) {
        Write-Host "✓ Logged in to Azure as: $($account.user.name)" -ForegroundColor Green
        Write-Host "  Subscription: $($account.name) ($($account.id))" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Not logged in to Azure CLI. Run: az login" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Azure CLI not found" -ForegroundColor Red
    $errors += "Azure CLI not installed"
}

Write-Host ""

# Check azd CLI
Write-Host "Checking Azure Developer CLI..." -ForegroundColor Yellow
try {
    $azdVersion = azd version 2>$null
    if ($azdVersion) {
        Write-Host "✓ Azure Developer CLI: $azdVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Azure Developer CLI not found" -ForegroundColor Red
    $errors += "Azure Developer CLI not installed"
}

Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
        
        # Check if Docker is running
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) {
            Write-Host "✓ Docker daemon is running" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Docker daemon not running. Start Docker Desktop." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️ Docker not found (optional for azd deployment)" -ForegroundColor Yellow
}

Write-Host ""

# Check Terraform
Write-Host "Checking Terraform..." -ForegroundColor Yellow
try {
    $tfVersion = terraform version 2>$null | Select-String "Terraform"
    if ($tfVersion) {
        Write-Host "✓ Terraform: $($tfVersion.Line.Trim())" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Terraform not found (azd will install automatically)" -ForegroundColor Yellow
}

Write-Host ""

# Check directory structure
Write-Host "Checking directory structure..." -ForegroundColor Yellow
$expectedDirs = @("backend", "frontend", "docker", "tests", ".github/workflows")
foreach ($dir in $expectedDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir/" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing directory: $dir/" -ForegroundColor Red
        $errors += "Missing directory: $dir"
    }
}

Write-Host ""

# Summary
if ($errors.Count -eq 0) {
    Write-Host "🎉 All checks passed! Ready for Azure deployment." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run setup script: .\setup-azure-deployment.ps1 -InitializeAzd"
    Write-Host "2. Deploy to Azure: azd up"
    Write-Host "3. Or configure GitHub Actions with repository secrets"
} else {
    Write-Host "❌ Issues found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please resolve these issues before deploying." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For detailed setup instructions, see: README-AZURE-DEPLOYMENT.md" -ForegroundColor Cyan