targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment which is used to generate a unique resource group name and resource names')
param environmentName string

@minLength(1)
@description('The Azure region where all resources will be deployed')
param location string

// Note: principalId is kept for azd compatibility even if not used in current deployment
@description('The Id of the azd service principal to add to deployed keyvault access policies')
#disable-next-line no-unused-params
param principalId string = ''

@description('A map of tags to apply to all resources')
param tags object = {}

@description('The name of the backend container image')
param backendImageName string = 'backend:latest'

@description('The name of the frontend container image')
param frontendImageName string = 'frontend:latest'

// Generate a unique token for resource naming
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

// Combine tags
#disable-next-line prefer-unquoted-property-names
var allTags = union(tags, {
  'azd-env-name': environmentName
  application: 'three-rivers-bank'
  component: 'infrastructure'
})

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: allTags
}

// Container Registry
module containerRegistry 'modules/container-registry.bicep' = {
  name: 'containerRegistry'
  scope: rg
  params: {
    name: 'cr${resourceToken}'
    location: location
    tags: allTags
  }
}

// Log Analytics Workspace
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'logAnalytics'
  scope: rg
  params: {
    name: 'log-${environmentName}'
    location: location
    tags: allTags
  }
}

// Container Apps Environment
module containerAppsEnvironment 'modules/container-apps-environment.bicep' = {
  name: 'containerAppsEnvironment'
  scope: rg
  params: {
    name: 'cae-${environmentName}'
    location: location
    tags: allTags
    logAnalyticsWorkspaceId: logAnalytics.outputs.id
  }
}

// Backend Container App
module backendApp 'modules/container-app.bicep' = {
  name: 'backendApp'
  scope: rg
  params: {
    name: 'ca-${environmentName}-backend'
    location: location
    tags: union(allTags, {
      'azd-service-name': 'backend'
    })
    containerAppsEnvironmentId: containerAppsEnvironment.outputs.id
    containerRegistryServer: containerRegistry.outputs.loginServer
    containerRegistryUsername: containerRegistry.outputs.adminUsername
    containerRegistryPassword: containerRegistry.outputs.adminPassword
    imageName: backendImageName
    targetPort: 8080
    cpu: '0.5'
    memory: '1Gi'
    minReplicas: 1
    maxReplicas: 3
    env: [
      {
        name: 'CORS_ALLOWED_ORIGINS'
        value: 'https://ca-${environmentName}-frontend.${containerAppsEnvironment.outputs.defaultDomain},http://localhost:5173,http://localhost:3000'
      }
      {
        name: 'BIAN_API_URL'
        value: 'https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0'
      }
      {
        name: 'H2_CONSOLE_ENABLED'
        value: 'false'
      }
      {
        name: 'LOGGING_LEVEL'
        value: 'INFO'
      }
      {
        name: 'SPRING_PROFILES_ACTIVE'
        value: 'production'
      }
    ]
  }
}

// Frontend Container App
module frontendApp 'modules/container-app.bicep' = {
  name: 'frontendApp'
  scope: rg
  params: {
    name: 'ca-${environmentName}-frontend'
    location: location
    tags: union(allTags, {
      'azd-service-name': 'frontend'
    })
    containerAppsEnvironmentId: containerAppsEnvironment.outputs.id
    containerRegistryServer: containerRegistry.outputs.loginServer
    containerRegistryUsername: containerRegistry.outputs.adminUsername
    containerRegistryPassword: containerRegistry.outputs.adminPassword
    imageName: frontendImageName
    targetPort: 80
    cpu: '0.25'
    memory: '0.5Gi'
    minReplicas: 1
    maxReplicas: 3
    env: [
      {
        name: 'VITE_API_BASE_URL'
        value: 'https://${backendApp.outputs.fqdn}/api'
      }
    ]
  }
}

// Outputs for azd
output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP_NAME string = rg.name
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output BACKEND_URI string = 'https://${backendApp.outputs.fqdn}'
output FRONTEND_URI string = 'https://${frontendApp.outputs.fqdn}'
output AZURE_CONTAINER_ENVIRONMENT_NAME string = containerAppsEnvironment.outputs.name
output BACKEND_SERVICE_NAME string = backendApp.outputs.name
output FRONTEND_SERVICE_NAME string = frontendApp.outputs.name
