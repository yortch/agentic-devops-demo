# Configure Terraform to use Azure Resource Manager provider
terraform {
  required_version = ">= 1.1"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.0"
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

  # Remote state in Azure Storage — bootstrapped by CD pipeline via Azure CLI.
  # Config values are set via `azd env set` and substituted into provider.conf.json.
  # Auth uses ARM_ACCESS_KEY (local: setup-tfstate.sh, CI: cd.yml).
  backend "azurerm" {}
}

# Configure the Azure Provider
provider "azurerm" {
  resource_provider_registrations = "core"
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

# Container Registry
resource "azurecaf_name" "acr" {
  name          = var.environment_name
  resource_type = "azurerm_container_registry"
  random_length = 5
  clean_input   = true
}

resource "azurerm_container_registry" "main" {
  name                = azurecaf_name.acr.result
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.tags
}

# Log Analytics Workspace
resource "azurecaf_name" "log_analytics" {
  name          = var.environment_name
  resource_type = "azurerm_log_analytics_workspace"
  random_length = 0
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = azurecaf_name.log_analytics.result
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

# Container Apps Environment
resource "azurecaf_name" "container_env" {
  name          = var.environment_name
  resource_type = "azurerm_container_app_environment"
  random_length = 0
}

resource "azurerm_container_app_environment" "main" {
  name                       = azurecaf_name.container_env.result
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

# Backend Container App
resource "azurecaf_name" "backend_app" {
  name          = "${var.environment_name}-backend"
  resource_type = "azurerm_container_app"
  random_length = 0
}

resource "azurerm_container_app" "backend" {
  name                         = azurecaf_name.backend_app.result
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = merge(local.tags, { "azd-service-name" = "backend" })

  template {
    min_replicas = 2
    max_replicas = 3

    container {
      name   = "backend"
      image  = var.service_backend_image_name
      cpu    = var.container_cpu
      memory = var.container_memory

      readiness_probe {
        transport = "HTTP"
        path      = "/actuator/health"
        port      = 8080

        initial_delay            = 10
        period_seconds           = 10
        timeout                  = 5
        success_count_threshold  = 1
        failure_count_threshold  = 3
      }

      startup_probe {
        transport = "HTTP"
        path      = "/actuator/health"
        port      = 8080

        initial_delay            = 10
        period_seconds           = 10
        timeout                  = 5
        failure_count_threshold  = 10
      }

      env {
        name  = "CORS_ALLOWED_ORIGINS"
        value = "https://${azurecaf_name.frontend_app.result}.${azurerm_container_app_environment.main.default_domain},http://localhost:5173,http://localhost:3000"
      }

      env {
        name  = "BIAN_API_BASE_URL"
        value = "https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0"
      }

      env {
        name  = "SPRING_H2_CONSOLE_ENABLED"
        value = "false"
      }

      env {
        name  = "LOGGING_LEVEL_ROOT"
        value = "INFO"
      }

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "production"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 8080

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.main.admin_password
  }
}

# Frontend Container App
resource "azurecaf_name" "frontend_app" {
  name          = "${var.environment_name}-frontend"
  resource_type = "azurerm_container_app"
  random_length = 0
}

resource "azurerm_container_app" "frontend" {
  name                         = azurecaf_name.frontend_app.result
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = merge(local.tags, { "azd-service-name" = "frontend" })

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "frontend"
      image  = var.service_frontend_image_name
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "VITE_API_BASE_URL"
        value = "https://${azurerm_container_app.backend.ingress[0].fqdn}/api"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 80

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.main.admin_password
  }
}
