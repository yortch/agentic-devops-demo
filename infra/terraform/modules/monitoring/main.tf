# Monitoring Module
# Manages Log Analytics Workspace for monitoring and diagnostics

resource "azurecaf_name" "log_analytics" {
  name          = var.environment_name
  resource_type = "azurerm_log_analytics_workspace"
  random_length = 0
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = azurecaf_name.log_analytics.result
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  retention_in_days   = var.retention_in_days
  tags                = var.tags
}
