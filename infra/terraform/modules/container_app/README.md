# Container App Module

This module manages an Azure Container App with configurable replica counts, container settings, environment variables, and ingress configuration.

## Features

- Creates Container App with customizable replicas (1-30)
- Supports environment variable configuration
- Configurable ingress settings (external/internal)
- Optional container registry authentication
- Generates unique naming using Azure CAF conventions

## Usage

```hcl
module "container_app" {
  source = "./modules/container_app"

  app_name                     = "my-app"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = module.container_apps_environment.id
  
  container_name   = "app"
  container_image  = "myregistry.azurecr.io/myapp:latest"
  container_cpu    = 0.5
  container_memory = "1Gi"
  
  min_replicas = 1
  max_replicas = 3
  
  environment_variables = [
    {
      name  = "ENV"
      value = "production"
    },
    {
      name  = "PORT"
      value = "8080"
    }
  ]
  
  target_port      = 8080
  external_enabled = true
  
  registry_server   = azurerm_container_registry.main.login_server
  registry_username = azurerm_container_registry.main.admin_username
  registry_password = azurerm_container_registry.main.admin_password
  
  tags = {
    environment = "production"
    component   = "backend"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| app_name | The name of the container app | string | - | yes |
| resource_group_name | The name of the resource group | string | - | yes |
| container_app_environment_id | The Container Apps environment ID | string | - | yes |
| container_name | The name of the container | string | - | yes |
| container_image | The container image | string | - | yes |
| container_cpu | CPU allocation | number | 0.5 | no |
| container_memory | Memory allocation | string | "1Gi" | no |
| min_replicas | Minimum replicas (0-30) | number | 1 | no |
| max_replicas | Maximum replicas (1-30) | number | 3 | no |
| environment_variables | List of environment variables | list(object) | [] | no |
| target_port | Target port for ingress | number | 80 | no |
| external_enabled | Enable external ingress | bool | true | no |
| allow_insecure_connections | Allow HTTP connections | bool | false | no |
| registry_server | Container registry URL | string | null | no |
| registry_username | Container registry username | string | null | no |
| registry_password | Container registry password | string | null | no |
| tags | Tags to apply | map(string) | {} | no |

## Outputs

| Name | Description |
|------|-------------|
| id | The ID of the container app |
| name | The name of the container app |
| latest_revision_name | The latest revision name |
| latest_revision_fqdn | The latest revision FQDN |
| ingress_fqdn | The ingress FQDN |
