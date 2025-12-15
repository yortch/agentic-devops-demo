#!/usr/bin/env pwsh

# Three Rivers Bank - Azure Deployment Setup Script
# This script sets up the Azure infrastructure files and configuration for deployment

param(
    [Parameter()]
    [string]$Environment = "dev",
    
    [Parameter()]
    [string]$Location = "eastus",
    
    [Parameter()]
    [switch]$InitializeAzd = $false,
    
    [Parameter()]
    [switch]$Help = $false
)

function Show-Help {
    Write-Host @"
Azure Deployment Setup Script for Three Rivers Bank

USAGE:
    .\setup-azure-deployment.ps1 [OPTIONS]

OPTIONS:
    -Environment    Target environment (dev, staging, production). Default: dev
    -Location       Azure region for deployment. Default: eastus
    -InitializeAzd  Initialize azd CLI after setup
    -Help           Show this help message

EXAMPLES:
    .\setup-azure-deployment.ps1
    .\setup-azure-deployment.ps1 -Environment production -Location westus2
    .\setup-azure-deployment.ps1 -InitializeAzd

PREREQUISITES:
    - Azure CLI installed and logged in
    - Azure Developer CLI (azd) installed
    - Terraform installed (>= 1.0)
    - Docker installed and running
"@
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Azure CLI
    try {
        $azVersion = az --version 2>$null | Select-String "azure-cli"
        if ($azVersion) {
            Write-Host "✓ Azure CLI found: $($azVersion.Line.Trim())" -ForegroundColor Green
        }
    } catch {
        Write-Error "❌ Azure CLI not found. Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        return $false
    }
    
    # Check azd CLI
    try {
        $azdVersion = azd version 2>$null
        if ($azdVersion) {
            Write-Host "✓ Azure Developer CLI found: $azdVersion" -ForegroundColor Green
        }
    } catch {
        Write-Error "❌ Azure Developer CLI not found. Please install: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd"
        return $false
    }
    
    # Check Terraform
    try {
        $tfVersion = terraform version 2>$null | Select-String "Terraform"
        if ($tfVersion) {
            Write-Host "✓ Terraform found: $($tfVersion.Line.Trim())" -ForegroundColor Green
        }
    } catch {
        Write-Warning "⚠️ Terraform not found. Install from: https://www.terraform.io/downloads"
    }
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
        }
    } catch {
        Write-Warning "⚠️ Docker not found. Install from: https://www.docker.com/get-started"
    }
    
    return $true
}

function Setup-DirectoryStructure {
    Write-Host "Setting up directory structure..." -ForegroundColor Yellow
    
    # Create infra directory
    if (!(Test-Path "infra")) {
        New-Item -ItemType Directory -Path "infra" -Force | Out-Null
        Write-Host "✓ Created infra directory" -ForegroundColor Green
    }
    
    # Create .azd directory
    if (!(Test-Path ".azd")) {
        New-Item -ItemType Directory -Path ".azd" -Force | Out-Null
        Write-Host "✓ Created .azd directory" -ForegroundColor Green
    }
    
    # Copy Terraform files to infra directory
    if (Test-Path "terraform-main.tf") {
        Copy-Item "terraform-main.tf" "infra/main.tf" -Force
        Write-Host "✓ Copied main.tf to infra directory" -ForegroundColor Green
    }
    
    if (Test-Path "terraform-variables.tf") {
        Copy-Item "terraform-variables.tf" "infra/variables.tf" -Force
        Write-Host "✓ Copied variables.tf to infra directory" -ForegroundColor Green
    }
    
    if (Test-Path "terraform-outputs.tf") {
        Copy-Item "terraform-outputs.tf" "infra/outputs.tf" -Force
        Write-Host "✓ Copied outputs.tf to infra directory" -ForegroundColor Green
    }
    
    # Copy azd config
    if (Test-Path "azd-config.json") {
        Copy-Item "azd-config.json" ".azd/config.json" -Force
        Write-Host "✓ Copied azd config.json" -ForegroundColor Green
    }
}

function Setup-Environment {
    param([string]$EnvName, [string]$AzureLocation)
    
    Write-Host "Setting up environment: $EnvName" -ForegroundColor Yellow
    
    # Create environment-specific configuration
    $envConfig = @{
        "AZURE_LOCATION" = $AzureLocation
        "AZURE_SUBSCRIPTION_ID" = ""
        "ENVIRONMENT_NAME" = $EnvName
    }
    
    $envDir = ".azd\.azure\$EnvName"
    if (!(Test-Path $envDir)) {
        New-Item -ItemType Directory -Path $envDir -Force | Out-Null
    }
    
    # Write environment configuration
    $envConfig | ConvertTo-Json | Set-Content "$envDir\.env" -Force
    Write-Host "✓ Created environment configuration for $EnvName" -ForegroundColor Green
}

function Initialize-Azd {
    Write-Host "Initializing Azure Developer CLI..." -ForegroundColor Yellow
    
    try {
        # Check if already initialized
        if (Test-Path "azure.yaml") {
            Write-Host "✓ azd already initialized (azure.yaml exists)" -ForegroundColor Green
            return
        }
        
        # Initialize azd
        azd init --no-prompt 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ azd initialized successfully" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ azd initialization may have had issues. Check azure.yaml file."
        }
    } catch {
        Write-Error "❌ Failed to initialize azd: $_"
    }
}

function Show-NextSteps {
    param([string]$EnvName)
    
    Write-Host @"

🎉 Setup completed successfully!

NEXT STEPS:
1. Login to Azure (if not already done):
   az login

2. Set your Azure subscription:
   az account set --subscription <your-subscription-id>

3. Deploy to Azure:
   azd up --environment $EnvName

ALTERNATIVE COMMANDS:
   azd provision    # Deploy infrastructure only
   azd deploy       # Deploy applications only
   azd down         # Remove all resources

USEFUL COMMANDS:
   azd env list     # List environments
   azd show         # Show current deployment status
   azd logs         # View application logs

For detailed instructions, see: README-AZURE-DEPLOYMENT.md
"@ -ForegroundColor Cyan
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "Three Rivers Bank - Azure Deployment Setup" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host ""

# Check prerequisites
if (-not (Test-Prerequisites)) {
    exit 1
}

Write-Host ""

# Setup directory structure and files
Setup-DirectoryStructure

Write-Host ""

# Setup environment
Setup-Environment -EnvName $Environment -AzureLocation $Location

# Initialize azd if requested
if ($InitializeAzd) {
    Write-Host ""
    Initialize-Azd
}

Write-Host ""

# Show next steps
Show-NextSteps -EnvName $Environment