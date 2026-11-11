targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('azd environment name (AZURE_ENV_NAME). Drives every resource name, as the Terraform azurecaf names did.')
param environmentName string

@minLength(1)
@description('Azure region (AZURE_LOCATION). Must equal the existing resource group location, for example eastus.')
param location string

@description('Existing container registry name to adopt. Leave empty only for a brand-new environment.')
param acrName string = ''

@description('Set by azd (SERVICE_BACKEND_RESOURCE_EXISTS). True when the backend app already exists.')
param backendExists bool = false

@description('Set by azd (SERVICE_FRONTEND_RESOURCE_EXISTS). True when the frontend app already exists.')
param frontendExists bool = false

@description('Extra tags merged onto every resource (Terraform var.tags).')
param tags object = {}

var envTags = union(tags, {
  'azd-env-name': environmentName
  application: 'three-rivers-bank'
  component: 'infrastructure'
})

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: envTags
}

module resources 'resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    acrName: acrName
    backendExists: backendExists
    frontendExists: frontendExists
    tags: envTags
  }
}

output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.AZURE_CONTAINER_REGISTRY_NAME
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT
output AZURE_CONTAINER_ENVIRONMENT_NAME string = resources.outputs.AZURE_CONTAINER_ENVIRONMENT_NAME
output backend_uri string = resources.outputs.backend_uri
output frontend_uri string = resources.outputs.frontend_uri
output backend_service_name string = resources.outputs.backend_service_name
output frontend_service_name string = resources.outputs.frontend_service_name
