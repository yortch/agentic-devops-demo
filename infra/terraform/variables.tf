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
  description = "The Id of the azd service principal to add to deployed keyvault access policies"
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to apply to all resources"
  default     = {}
}

variable "backend_image_name" {
  type        = string
  description = "The name of the backend container image"
  default     = "backend:latest"
}

variable "frontend_image_name" {
  type        = string
  description = "The name of the frontend container image"
  default     = "frontend:latest"
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
