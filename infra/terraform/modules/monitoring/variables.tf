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
  description = "The Azure region where the workspace will be deployed"
}

variable "sku" {
  type        = string
  description = "The SKU for the Log Analytics workspace"
  default     = "PerGB2018"
  validation {
    condition     = contains(["Free", "PerGB2018", "PerNode", "Premium", "Standalone", "Standard"], var.sku)
    error_message = "SKU must be a valid Log Analytics workspace SKU"
  }
}

variable "retention_in_days" {
  type        = number
  description = "The workspace data retention in days"
  default     = 30
  validation {
    condition     = var.retention_in_days >= 30 && var.retention_in_days <= 730
    error_message = "Retention must be between 30 and 730 days"
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the workspace"
  default     = {}
}
