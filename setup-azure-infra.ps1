# Setup Azure Infrastructure for Three Rivers Bank
# This script creates the necessary directories and files for Azure deployment

Write-Host "Setting up Azure infrastructure files..." -ForegroundColor Green

# Create directories
if (!(Test-Path "infra")) {
    New-Item -ItemType Directory -Path "infra" -Force | Out-Null
    Write-Host "Created infra directory" -ForegroundColor Yellow
}

if (!(Test-Path ".azd")) {
    New-Item -ItemType Directory -Path ".azd" -Force | Out-Null  
    Write-Host "Created .azd directory" -ForegroundColor Yellow
}

Write-Host "Infrastructure directories created successfully!" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Run the setup script: .\setup-azure-infra.ps1"
Write-Host "2. Initialize azd: azd init"  
Write-Host "3. Deploy to Azure: azd up" -ForegroundColor Cyan