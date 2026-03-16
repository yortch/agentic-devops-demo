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
  description = "The Azure region where the environment will be deployed"
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "The ID of the Log Analytics workspace for monitoring"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the environment"
  default     = {}
}
