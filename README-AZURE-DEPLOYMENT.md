# Azure Deployment Guide for Three Rivers Bank

This guide covers deploying the Three Rivers Bank Credit Card application to Azure using Azure Developer CLI (azd) with Bicep. The Terraform files and state are retained as a fallback and are not used by the active azd configuration.

## Prerequisites

### Required Tools
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
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
The active infrastructure is under `infra/bicep/` and is selected in `azure.yaml`. The previous Terraform files remain under `infra/terraform/` for rollback. If you want azd to pick up the default environment setting, copy the azd config:
```bash
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

### Adopt an existing Terraform deployment

Select the existing azd environment and set the exact Azure region and container registry name already in use:

```bash
azd env select <environment-name>
azd env set AZURE_LOCATION <existing-resource-group-region>
azd env set AZURE_CONTAINER_REGISTRY_NAME <existing-registry-name>
azd provision --preview
```

Review the preview before applying. Stop if it proposes creating a duplicate resource, deleting a resource, changing the resource group location, or changing immutable Container Apps environment settings. The Bicep template preserves the current app images during adoption. After the preview is clean, run `azd up` to provision and deploy.

### Managing Environments

Container App names use `ca-<environment>-backend` and `ca-<environment>-frontend`. To stay within Azure's 32-character limit, the environment portion is truncated to 20 characters for both apps; a hyphen at the cutoff is collapsed with the suffix separator. Existing valid names that fit, including `ca-banking-demo-backend` and `ca-banking-demo-frontend`, remain unchanged. Other resource names continue to use the full environment name.

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

### Configure GitHub Actions OIDC

Configure these repository variables for the identity and subscription used by `.github/workflows/cd.yml`:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_LOCATION` (short Azure region name, such as `eastus`)

The app registration must have federated credentials matching the repository and branch refs used to run `.github/workflows/cd.yml` (see the branch-based examples in `README.md`), and Contributor access to the target subscription. The workflow does not select a GitHub Actions environment and does not use a client secret.

### Active Workflow
The repository includes [cd.yml](.github/workflows/cd.yml), which deploys with `azd up` after a successful CI run or by manual `workflow_dispatch`. It uses Azure OIDC login and discovers the existing registry in the selected environment's resource group before provisioning.

### Pipeline Stages
1. **Build and Test**: Compiles backend (Maven) and frontend (npm), runs unit tests and E2E tests with Playwright
2. **Deploy**: Uses `azd up` for infrastructure and application deployment

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
   - If `npm ci` fails inside Docker (for example, TLS errors reaching `registry.npmjs.org` on a corporate network), point the frontend build at an approved npm feed; leave it unset to use the public registry:
     ```bash
     azd env set NPM_REGISTRY https://packagefeedproxy.microsoft.io/npm/
     ```

4. **Terraform fallback state issues** (only when switching back to Terraform):
   ```bash
   # Reset Terraform state (use cautiously)
   cd infra/terraform
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
- **Terraform Azure Provider fallback**: [Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)