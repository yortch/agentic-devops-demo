output "id" {
  value       = azurerm_container_app.main.id
  description = "The ID of the container app"
}

output "name" {
  value       = azurerm_container_app.main.name
  description = "The name of the container app"
}

output "latest_revision_name" {
  value       = azurerm_container_app.main.latest_revision_name
  description = "The name of the latest revision"
}

output "latest_revision_fqdn" {
  value       = azurerm_container_app.main.latest_revision_fqdn
  description = "The FQDN of the latest revision"
}

output "ingress_fqdn" {
  value       = try(azurerm_container_app.main.ingress[0].fqdn, null)
  description = "The FQDN for ingress"
}
