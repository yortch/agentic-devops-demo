@description('The name of the Container Apps environment')
param name string

@description('The location for the Container Apps environment')
param location string

@description('Tags to apply to the Container Apps environment')
param tags object = {}

@description('The customer ID of the Log Analytics workspace')
param logAnalyticsCustomerId string

@description('The shared key of the Log Analytics workspace')
@secure()
param logAnalyticsSharedKey string

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsSharedKey
      }
    }
  }
}

output id string = containerAppsEnvironment.id
output name string = containerAppsEnvironment.name
output defaultDomain string = containerAppsEnvironment.properties.defaultDomain
