output "id" {
  value       = azurerm_container_registry.main.id
  description = "The ID of the container registry"
}

output "name" {
  value       = azurerm_container_registry.main.name
  description = "The name of the container registry"
}

output "login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "The login server URL for the container registry"
}

output "admin_username" {
  value       = azurerm_container_registry.main.admin_username
  description = "The admin username for the container registry"
  sensitive   = true
}

output "admin_password" {
  value       = azurerm_container_registry.main.admin_password
  description = "The admin password for the container registry"
  sensitive   = true
}
