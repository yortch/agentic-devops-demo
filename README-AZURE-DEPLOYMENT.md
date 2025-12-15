# Azure Deployment Guide for Three Rivers Bank

This guide covers deploying the Three Rivers Bank Credit Card application to Azure using Azure Developer CLI (azd) with Terraform.

## Prerequisites

### Required Tools
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
- [Terraform](https://www.terraform.io/downloads.html) (>= 1.0)
- [Docker](https://www.docker.com/get-started)

### Azure Setup
1. **Azure Subscription**: Ensure you have an active Azure subscription
2. **Service Principal**: Create a service principal for GitHub Actions
3. **Resource Permissions**: Ensure permissions to create resources in your subscription

## Local Development Deployment

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd three-rivers-bank

# Login to Azure
az login

# Initialize azd
azd init
```

### Setup Infrastructure Files
Run the PowerShell setup script to create the necessary directory structure:
```powershell
.\setup-azure-infra.ps1
```

Then manually move the Terraform files to the correct locations:
```bash
# Create infra directory and move files
mkdir -p infra
cp terraform-main.tf infra/main.tf
cp terraform-variables.tf infra/variables.tf
cp terraform-outputs.tf infra/outputs.tf

# Create .azd config
mkdir -p .azd
cp azd-config.json .azd/config.json
```

### Deploy to Azure
```bash
# Provision infrastructure and deploy applications
azd up

# Or run steps individually:
azd provision  # Deploy infrastructure only
azd deploy     # Deploy applications only
```

### Managing Environments
```bash
# Create a new environment
azd env new <environment-name>

# List environments  
azd env list

# Set active environment
azd env select <environment-name>

# View environment variables
azd env get-values
```

## GitHub Actions CI/CD Pipeline

### Setup Repository Secrets

1. **Create Service Principal**:
```bash
az ad sp create-for-rbac --name "three-rivers-bank-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

2. **Add Repository Secrets** in GitHub:
   - `AZURE_CLIENT_ID`: From service principal output
   - `AZURE_CLIENT_SECRET`: From service principal output  
   - `AZURE_TENANT_ID`: Your Azure tenant ID
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
   - `AZURE_CREDENTIALS`: Full JSON output from service principal creation

3. **Add Repository Variables**:
   - `AZURE_CLIENT_ID`: Same as secret (for OIDC)
   - `AZURE_TENANT_ID`: Same as secret (for OIDC)  
   - `AZURE_SUBSCRIPTION_ID`: Same as secret (for OIDC)

### Enable Workflow
Copy the GitHub Actions workflow:
```bash
cp github-actions-azure-deploy.yml .github/workflows/azure-deploy.yml
```

### Pipeline Stages
1. **Build**: Compiles backend (Maven) and frontend (npm)
2. **Test**: Runs unit tests and E2E tests with Playwright
3. **Deploy Infrastructure**: Uses `azd provision` to deploy Terraform infrastructure
4. **Deploy Applications**: Uses `azd deploy` to build and deploy container images
5. **Cleanup**: Handles rollback on failure

## Infrastructure Components

### Azure Resources Created
- **Resource Group**: Contains all resources
- **Container Registry**: Stores application container images  
- **Container App Environment**: Managed environment for container apps
- **Log Analytics Workspace**: Centralized logging
- **Container Apps**: Backend (Spring Boot) and Frontend (React/Nginx)

### Cost Optimization
- **Container Apps**: Auto-scaling from 1-3 replicas based on load
- **Container Registry**: Basic tier for development
- **Log Analytics**: 30-day retention to minimize costs

## Monitoring and Operations

### View Logs
```bash
# View application logs
azd logs --service backend
azd logs --service frontend

# Or use Azure CLI
az containerapp logs show --name <backend-app-name> --resource-group <rg-name>
```

### Scale Applications
```bash
# Scale manually (temporary)
az containerapp revision set-mode --name <app-name> --resource-group <rg-name> --mode single
az containerapp update --name <app-name> --resource-group <rg-name> --min-replicas 2 --max-replicas 5
```

### Access Applications
- **Frontend URL**: `https://<frontend-app-name>.azurecontainerapps.io`
- **Backend API**: `https://<backend-app-name>.azurecontainerapps.io`  
- **Backend Health**: `https://<backend-app-name>.azurecontainerapps.io/actuator/health`

## Troubleshooting

### Common Issues

1. **azd command not found**:
   - Install Azure Developer CLI: `winget install Microsoft.Azd`

2. **Authentication failures**:
   ```bash
   az login --use-device-code
   azd auth login
   ```

3. **Container image build failures**:
   - Ensure Docker is running
   - Check Dockerfile paths in azure.yaml

4. **Terraform state issues**:
   ```bash
   # Reset Terraform state (use cautiously)
   cd infra
   terraform init -reconfigure
   ```

5. **Resource naming conflicts**:
   - Azure resource names must be globally unique
   - The template uses random suffixes to avoid conflicts

### Debug Commands
```bash
# Check azd configuration
azd config list

# Verify infrastructure state
azd show

# Check environment variables
azd env get-values

# View detailed deployment logs
azd deploy --debug
```

## Clean Up Resources

### Remove All Resources
```bash
# Delete entire environment
azd down --purge

# Or delete specific services
azd down --service backend
azd down --service frontend
```

### Manual Cleanup
If azd cleanup fails, manually delete via Azure Portal or CLI:
```bash
# Delete resource group (removes all resources)
az group delete --name <resource-group-name> --yes --no-wait
```

## Security Considerations

1. **Container Registry**: Admin access enabled for azd deployment
2. **HTTPS Only**: All container apps configured with HTTPS ingress
3. **Environment Variables**: Sensitive values stored as container app secrets
4. **Network**: Container apps communicate over private network within environment
5. **Logging**: Application logs sent to Log Analytics workspace

## Next Steps

1. **Custom Domain**: Configure custom domain for frontend application
2. **SSL Certificates**: Add custom SSL certificates
3. **API Management**: Add Azure API Management for enhanced API security
4. **Key Vault**: Store application secrets in Azure Key Vault
5. **Application Insights**: Add detailed application monitoring
6. **Azure Front Door**: Add CDN and global load balancing

## Support

- **Azure Developer CLI**: [Documentation](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/)
- **Azure Container Apps**: [Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- **Terraform Azure Provider**: [Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)