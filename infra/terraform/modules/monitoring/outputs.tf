output "id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "The ID of the Log Analytics workspace"
}

output "name" {
  value       = azurerm_log_analytics_workspace.main.name
  description = "The name of the Log Analytics workspace"
}

output "workspace_id" {
  value       = azurerm_log_analytics_workspace.main.workspace_id
  description = "The workspace (customer) ID for the Log Analytics workspace"
}

output "primary_shared_key" {
  value       = azurerm_log_analytics_workspace.main.primary_shared_key
  description = "The primary shared key for the Log Analytics workspace"
  sensitive   = true
}
