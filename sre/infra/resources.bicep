@description('Name of the environment')
param environmentName string

@description('Location for all resources')
param location string

@description('Resource group ID of the already-deployed application')
param appResourceGroupId string

// ============================================================
// Variables
// ============================================================
var uniqueSuffix = uniqueString(resourceGroup().id, environmentName)
var agentName = 'sre-${environmentName}-${uniqueSuffix}'
var identityName = 'id-sre-${uniqueSuffix}'

// ============================================================
// Module: Managed Identity
// ============================================================
module identity 'modules/identity.bicep' = {
  name: 'identity'
  params: {
    location: location
    identityName: identityName
  }
}

// ============================================================
// Module: SRE Agent
// ============================================================
module sreAgent 'modules/sre-agent.bicep' = {
  name: 'sre-agent'
  params: {
    location: location
    agentName: agentName
    identityId: identity.outputs.identityId
    identityPrincipalId: identity.outputs.identityPrincipalId
    appResourceGroupId: appResourceGroupId
  }
}

// ============================================================
// Module: Alert Rules (on the application's backend container app)
// ============================================================
module alertRules 'modules/alert-rules.bicep' = {
  name: 'alert-rules'
  params: {
    appResourceGroupId: appResourceGroupId
    environmentName: environmentName
  }
}

// ============================================================
// Outputs
// ============================================================
output agentName string = sreAgent.outputs.agentName
output agentEndpoint string = sreAgent.outputs.agentEndpoint
output agentPortalUrl string = sreAgent.outputs.agentPortalUrl
output identityPrincipalId string = identity.outputs.identityPrincipalId
