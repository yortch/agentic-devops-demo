# Container Apps Environment Module
# Manages Azure Container Apps Environment with integrated Log Analytics

resource "azurecaf_name" "container_env" {
  name          = var.environment_name
  resource_type = "azurerm_container_app_environment"
  random_length = 0
}

resource "azurerm_container_app_environment" "main" {
  name                       = azurecaf_name.container_env.result
  resource_group_name        = var.resource_group_name
  location                   = var.location
  log_analytics_workspace_id = var.log_analytics_workspace_id
  tags                       = var.tags
}
