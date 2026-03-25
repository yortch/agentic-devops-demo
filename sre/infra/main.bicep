targetScope = 'subscription'

@description('Name of the azd environment (auto-populated by azd)')
param environmentName string

@description('Primary location for all resources')
@allowed(['swedencentral', 'eastus2', 'australiaeast'])
param location string = 'eastus2'

@description('Resource group of the already-deployed Three Rivers Bank application')
param appResourceGroup string

@description('Name of the backend container app to monitor (from app deployment output)')
param backendContainerAppName string

// SRE Agent gets its own resource group
var resourceGroupName = 'rg-sre-${environmentName}'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

// Reference the existing application resource group
resource appRg 'Microsoft.Resources/resourceGroups@2024-03-01' existing = {
  name: appResourceGroup
}

// Deploy all SRE resources
module resources 'resources.bicep' = {
  name: 'sre-resources'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    appResourceGroupId: appRg.id
    backendContainerAppName: backendContainerAppName
  }
}

// Subscription-scoped RBAC for the SRE Agent managed identity
module subscriptionRbac 'modules/subscription-rbac.bicep' = {
  name: 'subscription-rbac'
  params: {
    principalId: resources.outputs.identityPrincipalId
  }
}

// Outputs consumed by post-provision.sh
output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_LOCATION string = location
output APP_RESOURCE_GROUP string = appResourceGroup
output SRE_AGENT_NAME string = resources.outputs.agentName
output SRE_AGENT_ENDPOINT string = resources.outputs.agentEndpoint
output AGENT_PORTAL_URL string = resources.outputs.agentPortalUrl
