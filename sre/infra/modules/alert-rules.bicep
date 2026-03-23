@description('Application resource group ID (alerts are created in the SRE RG but scope to the app RG)')
param appResourceGroupId string

@description('Environment name for naming')
param environmentName string

// Action Group — SRE Agent picks up alerts via managed resources
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-sre-${environmentName}'
  location: 'global'
  properties: {
    groupShortName: 'SREAgent'
    enabled: true
  }
}

// Alert: HTTP 5xx errors on the backend container app
// Note: The scopes reference the app resource group — Azure Monitor
// evaluates metrics from container apps in that RG. The SRE Agent
// automatically picks up fired alerts from its managed resource groups.
resource http5xxAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-http-5xx-${environmentName}'
  location: 'global'
  properties: {
    description: 'Backend HTTP 5xx errors exceeded threshold — triggers SRE Agent investigation'
    severity: 2
    enabled: true
    scopes: [
      appResourceGroupId
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    targetResourceType: 'Microsoft.App/containerApps'
    targetResourceRegion: 'eastus2'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'http5xx'
          metricName: 'Requests'
          metricNamespace: 'microsoft.app/containerapps'
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Total'
          dimensions: [
            {
              name: 'statusCodeCategory'
              operator: 'Include'
              values: [
                '5xx'
              ]
            }
          ]
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Alert: Container restarts (OOM, crash loops)
resource restartAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-restart-${environmentName}'
  location: 'global'
  properties: {
    description: 'Container app replica restarted — likely OOM kill, crash loop, or failed health probe'
    severity: 1
    enabled: true
    scopes: [
      appResourceGroupId
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    targetResourceType: 'Microsoft.App/containerApps'
    targetResourceRegion: 'eastus2'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'restarts'
          metricName: 'RestartCount'
          metricNamespace: 'microsoft.app/containerapps'
          operator: 'GreaterThan'
          threshold: 0
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// Alert: High response time
resource latencyAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-latency-${environmentName}'
  location: 'global'
  properties: {
    description: 'Backend average response time elevated — may indicate resource starvation or slow dependencies'
    severity: 3
    enabled: true
    scopes: [
      appResourceGroupId
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    targetResourceType: 'Microsoft.App/containerApps'
    targetResourceRegion: 'eastus2'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.MultipleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'highLatency'
          metricName: 'ResponseTime'
          metricNamespace: 'microsoft.app/containerapps'
          operator: 'GreaterThan'
          threshold: 3000
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}
