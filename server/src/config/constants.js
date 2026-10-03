module.exports = {
  ROLES: {
    ADMIN: 'ADMIN',
    TEAM_ADMIN: 'TEAM_ADMIN',
    DEVELOPER: 'DEVELOPER',
    VIEWER: 'VIEWER'
  },
  SERVICE_STATUS: {
    HEALTHY: 'Healthy',
    DEGRADED: 'Degraded',
    DOWN: 'Down',
    MAINTENANCE: 'Maintenance',
    UNKNOWN: 'Unknown'
  },
  CRITICALITY: {
    TIER_1: 'Tier 1 - Critical',
    TIER_2: 'Tier 2 - High',
    TIER_3: 'Tier 3 - Medium',
    TIER_4: 'Tier 4 - Low'
  },
  SERVICE_TYPES: [
    'Backend Service',
    'Frontend Application',
    'Mobile Application',
    'API',
    'Worker',
    'Scheduled Job',
    'Database',
    'External Integration'
  ],
  ENVIRONMENTS: ['Development', 'Staging', 'Production'],
  DEPENDENCY_TYPES: [
    'REST API',
    'Database',
    'Message Queue',
    'External API',
    'Authentication',
    'Storage',
    'Other'
  ],
  DEPLOYMENT_STATUS: [
    'Pending',
    'Running',
    'Successful',
    'Failed',
    'Rolled Back'
  ],
  HTTP_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
};
