# Container App Module
# Manages Azure Container App with configurable settings

resource "azurecaf_name" "app" {
  name          = var.app_name
  resource_type = "azurerm_container_app"
  random_length = 0
}

resource "azurerm_container_app" "main" {
  name                         = azurecaf_name.app.result
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = var.revision_mode
  tags                         = var.tags

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.container_name
      image  = var.container_image
      cpu    = var.container_cpu
      memory = var.container_memory

      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.value.name
          value = env.value.value
        }
      }
    }
  }

  ingress {
    allow_insecure_connections = var.allow_insecure_connections
    external_enabled           = var.external_enabled
    target_port                = var.target_port

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  dynamic "registry" {
    for_each = var.registry_server != null ? [1] : []
    content {
      server               = var.registry_server
      username             = var.registry_username
      password_secret_name = "acr-password"
    }
  }

  dynamic "secret" {
    for_each = var.registry_password != null ? [1] : []
    content {
      name  = "acr-password"
      value = var.registry_password
    }
  }
}
