# Terraform Modules

This directory contains reusable Terraform modules for deploying Azure infrastructure for the Three Rivers Bank application.

## Module Structure

```
modules/
├── container_registry/       # Azure Container Registry for Docker images
├── monitoring/               # Log Analytics Workspace for monitoring
├── container_apps_environment/  # Container Apps hosting environment
└── container_app/            # Individual Container App instances
```

## Architecture

The modular structure separates infrastructure concerns into focused, reusable components:

### 1. Container Registry Module (`container_registry/`)
Manages Azure Container Registry for storing and distributing container images.

**Key Features:**
- Configurable SKU (Basic, Standard, Premium)
- Admin authentication support
- Unique naming with Azure CAF conventions

**Dependencies:** None

### 2. Monitoring Module (`monitoring/`)
Provides Log Analytics Workspace for collecting telemetry and logs.

**Key Features:**
- Configurable data retention (30-730 days)
- Multiple SKU options
- Integration with Container Apps Environment

**Dependencies:** None

### 3. Container Apps Environment Module (`container_apps_environment/`)
Creates the hosting environment for container applications with integrated monitoring.

**Key Features:**
- Log Analytics integration
- Default domain provisioning
- Static IP allocation

**Dependencies:**
- `monitoring` module (Log Analytics Workspace ID)

### 4. Container App Module (`container_app/`)
Reusable module for deploying individual container applications.

**Key Features:**
- Configurable replica scaling (1-30)
- Environment variable support
- Ingress configuration (internal/external)
- Container registry authentication
- Health probe support

**Dependencies:**
- `container_apps_environment` module (Environment ID)
- `container_registry` module (optional, for private images)

## Usage Example

```hcl
# Root main.tf example

# Create Container Registry
module "container_registry" {
  source = "./modules/container_registry"

  environment_name    = var.environment_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

# Create Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  environment_name    = var.environment_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  tags                = local.tags
}

# Create Container Apps Environment
module "container_apps_environment" {
  source = "./modules/container_apps_environment"

  environment_name           = var.environment_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = var.location
  log_analytics_workspace_id = module.monitoring.id
  tags                       = local.tags
}

# Deploy Backend App
module "backend_app" {
  source = "./modules/container_app"

  app_name                     = "${var.environment_name}-backend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = module.container_apps_environment.id

  container_name   = "backend"
  container_image  = "${module.container_registry.login_server}/backend:latest"
  container_cpu    = 0.5
  container_memory = "1Gi"

  environment_variables = [
    {
      name  = "PORT"
      value = "8080"
    }
  ]

  target_port = 8080

  registry_server   = module.container_registry.login_server
  registry_username = module.container_registry.admin_username
  registry_password = module.container_registry.admin_password

  tags = local.tags
}
```

## Module Development Guidelines

### Naming Conventions
- Use `azurecaf_name` resource for Azure CAF naming
- Module names should be descriptive and lowercase with underscores
- Variable names should use snake_case

### Input Variables
- Always provide descriptions
- Set sensible defaults where applicable
- Use validation blocks for constrained values
- Mark sensitive values appropriately

### Outputs
- Output all relevant resource attributes
- Mark sensitive outputs (passwords, keys)
- Provide clear descriptions

### Documentation
- Each module must have a README.md
- Include usage examples
- Document all inputs and outputs
- Specify dependencies

## Benefits of Modularization

### Separation of Concerns
Each module encapsulates a specific Azure service or component, making the codebase easier to understand and maintain.

### Reusability
Modules can be instantiated multiple times with different configurations:
```hcl
# Deploy multiple container apps using the same module
module "backend_app" { ... }
module "frontend_app" { ... }
module "api_app" { ... }
```

### Testability
Individual modules can be tested in isolation, improving reliability and reducing deployment risks.

### Scalability
Adding new resources is as simple as calling existing modules with new parameters:
```hcl
module "new_microservice" {
  source = "./modules/container_app"
  # ... configuration
}
```

### Version Control
Modules can be versioned independently, allowing for controlled upgrades and rollbacks.

### Team Collaboration
Different team members can work on different modules without conflicts, improving development velocity.

## Future Enhancements

Potential modules to add as infrastructure grows:

- **networking/** - Virtual Network, Subnets, NSGs
- **database/** - Azure Database for PostgreSQL/MySQL
- **storage/** - Azure Storage Accounts, Blob Containers
- **key_vault/** - Azure Key Vault for secrets management
- **cdn/** - Azure CDN for static content delivery
- **api_management/** - Azure API Management for API gateway
- **application_insights/** - Enhanced application monitoring

## Terraform Commands

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Plan deployment
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy resources
terraform destroy
```

## Testing

Each module should be tested:

1. **Syntax Validation**: `terraform validate`
2. **Format Check**: `terraform fmt -check`
3. **Plan Verification**: Review `terraform plan` output
4. **Integration Test**: Deploy to a test environment

## Support

For questions or issues with these modules, please refer to:
- [Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Terraform Module Documentation](https://www.terraform.io/docs/language/modules/index.html)
- [Azure CAF Provider](https://registry.terraform.io/providers/aztfmod/azurecaf/latest/docs)
