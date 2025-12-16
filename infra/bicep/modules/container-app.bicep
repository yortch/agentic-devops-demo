@description('The name of the Container App')
param name string

@description('The location for the Container App')
param location string

@description('Tags to apply to the Container App')
param tags object = {}

@description('The resource ID of the Container Apps environment')
param containerAppsEnvironmentId string

@description('The container registry server')
param containerRegistryServer string

@description('The container registry username')
param containerRegistryUsername string

@description('The container registry password')
@secure()
param containerRegistryPassword string

// Note: imageName is used by azd to deploy the actual container image after provisioning
@description('The container image name')
#disable-next-line no-unused-params
param imageName string

@description('The target port for ingress')
param targetPort int

@description('The CPU allocation for the container (in cores, e.g., 0.25, 0.5, 1)')
param cpu string

@description('The memory allocation for the container')
param memory string

@description('The minimum number of replicas')
@minValue(0)
@maxValue(30)
param minReplicas int = 1

@description('The maximum number of replicas')
@minValue(1)
@maxValue(30)
param maxReplicas int = 3

@description('Environment variables for the container')
param env array = []

@description('The name of the container inside the container app')
param containerName string = ''

// Use a placeholder image until the actual image is deployed by azd
var defaultImage = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
// Derive container name from the app name's last segment if not explicitly provided
var derivedContainerName = !empty(containerName) ? containerName : last(split(name, '-'))

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: targetPort
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: containerRegistryServer
          username: containerRegistryUsername
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistryPassword
        }
      ]
    }
    template: {
      containers: [
        {
          name: derivedContainerName
          image: defaultImage
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: env
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

output id string = containerApp.id
output name string = containerApp.name
output fqdn string = containerApp.properties.configuration.ingress.fqdn
output latestRevisionFqdn string = containerApp.properties.latestRevisionFqdn
