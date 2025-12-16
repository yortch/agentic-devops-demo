# Container Registry Module
# Manages Azure Container Registry for storing Docker images

resource "azurecaf_name" "acr" {
  name          = var.environment_name
  resource_type = "azurerm_container_registry"
  random_length = 5
  clean_input   = true
}

resource "azurerm_container_registry" "main" {
  name                = azurecaf_name.acr.result
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = var.admin_enabled
  tags                = var.tags
}
