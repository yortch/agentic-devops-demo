variable "app_name" {
  type        = string
  description = "The name of the container app"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "container_app_environment_id" {
  type        = string
  description = "The ID of the Container Apps environment"
}

variable "revision_mode" {
  type        = string
  description = "The revision mode (Single or Multiple)"
  default     = "Single"
  validation {
    condition     = contains(["Single", "Multiple"], var.revision_mode)
    error_message = "Revision mode must be Single or Multiple"
  }
}

variable "min_replicas" {
  type        = number
  description = "Minimum number of replicas"
  default     = 1
  validation {
    condition     = var.min_replicas >= 0 && var.min_replicas <= 30
    error_message = "Min replicas must be between 0 and 30"
  }
}

variable "max_replicas" {
  type        = number
  description = "Maximum number of replicas"
  default     = 3
  validation {
    condition     = var.max_replicas >= 1 && var.max_replicas <= 30
    error_message = "Max replicas must be between 1 and 30"
  }
}

variable "container_name" {
  type        = string
  description = "The name of the container"
}

variable "container_image" {
  type        = string
  description = "The container image to deploy"
}

variable "container_cpu" {
  type        = number
  description = "The amount of CPU to allocate to the container"
  default     = 0.5
}

variable "container_memory" {
  type        = string
  description = "The amount of memory to allocate to the container"
  default     = "1Gi"
}

variable "environment_variables" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "List of environment variables for the container"
  default     = []
}

variable "target_port" {
  type        = number
  description = "The target port for ingress traffic"
  default     = 80
}

variable "external_enabled" {
  type        = bool
  description = "Enable external ingress"
  default     = true
}

variable "allow_insecure_connections" {
  type        = bool
  description = "Allow insecure HTTP connections"
  default     = false
}

variable "registry_server" {
  type        = string
  description = "The container registry server URL"
  default     = null
}

variable "registry_username" {
  type        = string
  description = "The container registry username"
  default     = null
  sensitive   = true
}

variable "registry_password" {
  type        = string
  description = "The container registry password"
  default     = null
  sensitive   = true
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the container app"
  default     = {}
}
