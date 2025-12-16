# Monitoring Module

This module manages an Azure Log Analytics Workspace for collecting and analyzing telemetry data from Azure resources.

## Features

- Creates Log Analytics Workspace with configurable retention
- Supports multiple SKU tiers
- Generates unique naming using Azure CAF conventions
- Outputs workspace ID for integration with other services

## Usage

```hcl
module "monitoring" {
  source = "./modules/monitoring"

  environment_name    = "dev"
  resource_group_name = azurerm_resource_group.main.name
  location            = "East US"
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = {
    environment = "development"
    component   = "monitoring"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment_name | The name of the environment | string | - | yes |
| resource_group_name | The name of the resource group | string | - | yes |
| location | The Azure region | string | - | yes |
| sku | The SKU tier | string | "PerGB2018" | no |
| retention_in_days | Data retention in days (30-730) | number | 30 | no |
| tags | Tags to apply | map(string) | {} | no |

## Outputs

| Name | Description |
|------|-------------|
| id | The ID of the workspace |
| name | The name of the workspace |
| workspace_id | The workspace (customer) ID |
| primary_shared_key | The primary shared key (sensitive) |
