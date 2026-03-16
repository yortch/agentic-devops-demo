output "azure_location" {
  value       = azurerm_resource_group.main.location
  description = "The Azure region where resources are deployed"
}

output "azure_resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "The name of the resource group"
}

output "azure_container_registry_endpoint" {
  value       = module.container_registry.login_server
  description = "The endpoint for the container registry"
}

output "backend_uri" {
  value       = "https://${module.backend_app.latest_revision_fqdn}"
  description = "The URI for the backend service"
}

output "frontend_uri" {
  value       = "https://${module.frontend_app.latest_revision_fqdn}"
  description = "The URI for the frontend service"
}

output "azure_container_environment_name" {
  value       = module.container_apps_environment.name
  description = "The name of the container app environment"
}

output "backend_service_name" {
  value       = module.backend_app.name
  description = "The name of the backend container app"
}

output "frontend_service_name" {
  value       = module.frontend_app.name
  description = "The name of the frontend container app"
}
