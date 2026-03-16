# Container Registry Module

This module manages an Azure Container Registry (ACR) for storing and managing Docker container images.

## Features

- Creates Azure Container Registry with configurable SKU
- Supports admin user authentication
- Generates unique naming using Azure CAF conventions
- Outputs registry credentials for container app integration

## Usage

```hcl
module "container_registry" {
  source = "./modules/container_registry"

  environment_name    = "dev"
  resource_group_name = azurerm_resource_group.main.name
  location            = "East US"
  sku                 = "Basic"
  admin_enabled       = true
  tags                = {
    environment = "development"
    component   = "container-registry"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment_name | The name of the environment | string | - | yes |
| resource_group_name | The name of the resource group | string | - | yes |
| location | The Azure region | string | - | yes |
| sku | The SKU tier (Basic, Standard, Premium) | string | "Basic" | no |
| admin_enabled | Enable admin user | bool | true | no |
| tags | Tags to apply | map(string) | {} | no |

## Outputs

| Name | Description |
|------|-------------|
| id | The ID of the container registry |
| name | The name of the container registry |
| login_server | The login server URL |
| admin_username | The admin username (sensitive) |
| admin_password | The admin password (sensitive) |
