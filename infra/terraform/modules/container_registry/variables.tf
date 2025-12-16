variable "environment_name" {
  type        = string
  description = "The name of the environment"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "location" {
  type        = string
  description = "The Azure region where the container registry will be deployed"
}

variable "sku" {
  type        = string
  description = "The SKU tier for the container registry"
  default     = "Basic"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.sku)
    error_message = "SKU must be Basic, Standard, or Premium"
  }
}

variable "admin_enabled" {
  type        = bool
  description = "Enable admin user for the container registry"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the container registry"
  default     = {}
}
