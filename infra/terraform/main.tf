# Configure Terraform to use Azure Resource Manager provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
    azurecaf = {
      source  = "aztfmod/azurecaf"
      version = "~>1.2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.4.0"
    }
  }
}

# Configure the Azure Provider
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Get current Azure client configuration
data "azurerm_client_config" "current" {}

# Generate random suffix for unique naming
resource "random_string" "resource_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Local values for consistent naming
locals {
  # Default location for all resources
  location = var.location

  # Resource naming
  resource_token = random_string.resource_suffix.result

  # Tags applied to all resources
  tags = merge(var.tags, {
    "azd-env-name" = var.environment_name
    "application"  = "three-rivers-bank"
    "component"    = "infrastructure"
  })
}

# Resource Group
resource "azurecaf_name" "rg" {
  name          = var.environment_name
  resource_type = "azurerm_resource_group"
  random_length = 0
}

resource "azurerm_resource_group" "main" {
  name     = azurecaf_name.rg.result
  location = local.location
  tags     = local.tags
}

# Container Registry Module
module "container_registry" {
  source = "./modules/container_registry"

  environment_name    = var.environment_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.tags
}

# Monitoring Module (Log Analytics)
module "monitoring" {
  source = "./modules/monitoring"

  environment_name    = var.environment_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

# Container Apps Environment Module
module "container_apps_environment" {
  source = "./modules/container_apps_environment"

  environment_name           = var.environment_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = module.monitoring.id
  tags                       = local.tags
}

# Backend Container App Module
module "backend_app" {
  source = "./modules/container_app"

  app_name                     = "${var.environment_name}-backend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = module.container_apps_environment.id

  container_name   = "backend"
  container_image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
  container_cpu    = 0.5
  container_memory = "1Gi"

  min_replicas = 1
  max_replicas = 3

  environment_variables = [
    {
      name  = "CORS_ALLOWED_ORIGINS"
      value = "https://${var.environment_name}-frontend.${module.container_apps_environment.default_domain},http://localhost:5173,http://localhost:3000"
    },
    {
      name  = "BIAN_API_URL"
      value = "https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0"
    },
    {
      name  = "H2_CONSOLE_ENABLED"
      value = "false"
    },
    {
      name  = "LOGGING_LEVEL"
      value = "INFO"
    },
    {
      name  = "SPRING_PROFILES_ACTIVE"
      value = "production"
    }
  ]

  target_port                = 8080
  external_enabled           = true
  allow_insecure_connections = false

  registry_server   = module.container_registry.login_server
  registry_username = module.container_registry.admin_username
  registry_password = module.container_registry.admin_password

  tags = merge(local.tags, { "azd-service-name" = "backend" })
}

# Frontend Container App Module
module "frontend_app" {
  source = "./modules/container_app"

  app_name                     = "${var.environment_name}-frontend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = module.container_apps_environment.id

  container_name   = "frontend"
  container_image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
  container_cpu    = 0.25
  container_memory = "0.5Gi"

  min_replicas = 1
  max_replicas = 3

  environment_variables = [
    {
      name  = "VITE_API_BASE_URL"
      value = "https://${module.backend_app.ingress_fqdn}/api"
    }
  ]

  target_port                = 80
  external_enabled           = true
  allow_insecure_connections = false

  registry_server   = module.container_registry.login_server
  registry_username = module.container_registry.admin_username
  registry_password = module.container_registry.admin_password

  tags = merge(local.tags, { "azd-service-name" = "frontend" })
}
