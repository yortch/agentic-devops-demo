@description('The name of the Log Analytics workspace')
param name string

@description('The location for the Log Analytics workspace')
param location string

@description('Tags to apply to the Log Analytics workspace')
param tags object = {}

@description('The SKU for the Log Analytics workspace')
@allowed([
  'Free'
  'PerGB2018'
  'PerNode'
  'Premium'
  'Standalone'
  'Standard'
])
param sku string = 'PerGB2018'

@description('The retention period for the Log Analytics workspace in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 30

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      name: sku
    }
    retentionInDays: retentionInDays
  }
}

output id string = logAnalytics.id
output name string = logAnalytics.name
output customerId string = logAnalytics.properties.customerId

// Note: primarySharedKey is used by Container Apps Environment for log configuration
#disable-next-line outputs-should-not-contain-secrets
output primarySharedKey string = logAnalytics.listKeys().primarySharedKey
