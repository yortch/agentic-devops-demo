# Container Apps Environment Module

This module manages an Azure Container Apps Environment, which provides the hosting environment for container apps with integrated monitoring.

## Features

- Creates Container Apps Environment with Log Analytics integration
- Generates unique naming using Azure CAF conventions
- Provides default domain and static IP for container apps
- Supports tagging for resource organization

## Usage

```hcl
module "container_apps_environment" {
  source = "./modules/container_apps_environment"

  environment_name           = "dev"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = "East US"
  log_analytics_workspace_id = module.monitoring.id
  tags                       = {
    environment = "development"
    component   = "container-apps"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment_name | The name of the environment | string | - | yes |
| resource_group_name | The name of the resource group | string | - | yes |
| location | The Azure region | string | - | yes |
| log_analytics_workspace_id | The Log Analytics workspace ID | string | - | yes |
| tags | Tags to apply | map(string) | {} | no |

## Outputs

| Name | Description |
|------|-------------|
| id | The ID of the environment |
| name | The name of the environment |
| default_domain | The default domain |
| static_ip_address | The static IP address |
