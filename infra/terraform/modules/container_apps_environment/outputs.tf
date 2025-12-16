output "id" {
  value       = azurerm_container_app_environment.main.id
  description = "The ID of the Container Apps environment"
}

output "name" {
  value       = azurerm_container_app_environment.main.name
  description = "The name of the Container Apps environment"
}

output "default_domain" {
  value       = azurerm_container_app_environment.main.default_domain
  description = "The default domain for the Container Apps environment"
}

output "static_ip_address" {
  value       = azurerm_container_app_environment.main.static_ip_address
  description = "The static IP address of the Container Apps environment"
}
