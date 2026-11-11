param environmentName string
param location string
param acrName string
param backendExists bool
param frontendExists bool
param tags object

var resolvedAcrName = !empty(acrName)
  ? acrName
  : 'cr${replace(environmentName, '-', '')}${take(uniqueString(subscription().id, environmentName), 5)}'
var logName = 'log-${environmentName}'
var caeName = 'cae-${environmentName}'
// Reserve prefix/suffix space within 32 characters and avoid a double hyphen at the truncation boundary.
var backendName = replace('ca-${take(environmentName, 20)}-backend', '--', '-')
var frontendName = replace('ca-${take(environmentName, 20)}-frontend', '--', '-')
var placeholderImage = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

resource law 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: resolvedAcrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource cae 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: caeName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
  }
}

module backendFetch 'fetch-container-image.bicep' = {
  name: 'backend-fetch-image'
  params: {
    exists: backendExists
    name: backendName
  }
}

module frontendFetch 'fetch-container-image.bicep' = {
  name: 'frontend-fetch-image'
  params: {
    exists: frontendExists
    name: frontendName
  }
}

resource backend 'Microsoft.App/containerApps@2024-03-01' = {
  name: backendName
  location: location
  tags: union(tags, {
    'azd-service-name': 'backend'
  })
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
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
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      scale: {
        minReplicas: 2
        maxReplicas: 3
      }
      containers: [
        {
          name: 'backend'
          image: backendFetch.outputs.?containers[?0].?image ?? placeholderImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health'
                port: 8080
                scheme: 'HTTP'
              }
              timeoutSeconds: 5
              successThreshold: 1
              failureThreshold: 3
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health'
                port: 8080
                scheme: 'HTTP'
              }
              timeoutSeconds: 5
              failureThreshold: 10
            }
          ]
          env: [
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: 'https://${frontendName}.${cae.properties.defaultDomain},http://localhost:5173,http://localhost:3000'
            }
            {
              name: 'BIAN_API_BASE_URL'
              value: 'https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0'
            }
            {
              name: 'SPRING_H2_CONSOLE_ENABLED'
              value: 'false'
            }
            {
              name: 'LOGGING_LEVEL_ROOT'
              value: 'INFO'
            }
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'production'
            }
          ]
        }
      ]
    }
  }
}

resource frontend 'Microsoft.App/containerApps@2024-03-01' = {
  name: frontendName
  location: location
  tags: union(tags, {
    'azd-service-name': 'frontend'
  })
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 80
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
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
      containers: [
        {
          name: 'frontend'
          image: frontendFetch.outputs.?containers[?0].?image ?? placeholderImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'VITE_API_BASE_URL'
              value: 'https://${backendName}.${cae.properties.defaultDomain}/api'
            }
          ]
        }
      ]
    }
  }
}

output AZURE_CONTAINER_REGISTRY_NAME string = acr.name
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer
output AZURE_CONTAINER_ENVIRONMENT_NAME string = cae.name
output backend_uri string = 'https://${backend.properties.configuration.ingress.fqdn}'
output frontend_uri string = 'https://${frontend.properties.configuration.ingress.fqdn}'
output backend_service_name string = backend.name
output frontend_service_name string = frontend.name
