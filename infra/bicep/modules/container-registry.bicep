@description('The name of the container registry')
param name string

@description('The location for the container registry')
param location string

@description('Tags to apply to the container registry')
param tags object = {}

@description('The SKU for the container registry')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param sku string = 'Basic'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: true
  }
}

output id string = containerRegistry.id
output name string = containerRegistry.name
output loginServer string = containerRegistry.properties.loginServer
output adminUsername string = containerRegistry.name

// Note: admin password is passed to container app secrets, suppressing warning for this deployment pattern
#disable-next-line outputs-should-not-contain-secrets
output adminPassword string = containerRegistry.listCredentials().passwords[0].value
