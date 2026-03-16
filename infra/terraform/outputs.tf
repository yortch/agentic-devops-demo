output "AZURE_LOCATION" {
  value       = azurerm_resource_group.main.location
  description = "The Azure region where resources are deployed"
}

output "AZURE_RESOURCE_GROUP" {
  value       = azurerm_resource_group.main.name
  description = "The name of the resource group"
}

output "AZURE_CONTAINER_REGISTRY_ENDPOINT" {
  value       = azurerm_container_registry.main.login_server
  description = "The endpoint for the container registry"
}

output "AZURE_CONTAINER_ENVIRONMENT_NAME" {
  value       = azurerm_container_app_environment.main.name
  description = "The name of the container app environment"
}

output "backend_uri" {
  value       = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
  description = "The URI for the backend service"
}

output "frontend_uri" {
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
  description = "The URI for the frontend service"
}

output "backend_service_name" {
  value       = azurerm_container_app.backend.name
  description = "The name of the backend container app"
}

output "frontend_service_name" {
  value       = azurerm_container_app.frontend.name
  description = "The name of the frontend container app"
}
