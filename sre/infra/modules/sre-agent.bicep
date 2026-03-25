@description('Location for resources')
param location string

@description('SRE Agent name')
param agentName string

@description('User-Assigned Managed Identity resource ID')
param identityId string

@description('User-Assigned Managed Identity principal ID')
param identityPrincipalId string

@description('Application resource group ID to monitor')
param appResourceGroupId string

// SRE Agent Administrator role — required for data plane API access
var sreAgentAdminRoleId = 'e79298df-d852-4c6d-84f9-5d13249d1e55'

#disable-next-line BCP081
resource sreAgent 'Microsoft.App/agents@2025-05-01-preview' = {
  name: agentName
  location: location
  tags: {
    application: 'three-rivers-bank'
    purpose: 'sre-monitoring'
  }
  identity: {
    type: 'SystemAssigned, UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    knowledgeGraphConfiguration: {
      managedResources: [
        appResourceGroupId
      ]
      identity: identityId
    }
    actionConfiguration: {
      mode: 'review'
      identity: identityId
      accessLevel: 'Low'
    }
    mcpServers: []
  }
}

// Assign SRE Agent Administrator to the deployer
resource sreAgentAdminRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(sreAgent.id, deployer().objectId, sreAgentAdminRoleId)
  scope: sreAgent
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', sreAgentAdminRoleId)
    principalId: deployer().objectId
    principalType: 'User'
  }
}

output agentName string = sreAgent.name
output agentId string = sreAgent.id
output agentEndpoint string = sreAgent.properties.agentEndpoint
output agentPortalUrl string = 'https://sre.azure.com'
