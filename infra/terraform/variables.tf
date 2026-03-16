variable "environment_name" {
  type        = string
  description = "The name of the azd environment to be deployed"
}

variable "location" {
  type        = string
  description = "The Azure region where all resources will be deployed"
  default     = "East US"
}

variable "principal_id" {
  type        = string
  description = "The Id of the azd service principal used by this deployment (this module does not configure Key Vault access policies)"
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to apply to all resources"
  default     = {}
}

variable "service_backend_image_name" {
  type        = string
  description = "The name of the backend container image"
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "service_frontend_image_name" {
  type        = string
  description = "The name of the frontend container image"
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "container_cpu" {
  type        = number
  description = "The amount of CPU to allocate to containers"
  default     = 0.5
}

variable "container_memory" {
  type        = string
  description = "The amount of memory to allocate to containers"
  default     = "1Gi"
}
