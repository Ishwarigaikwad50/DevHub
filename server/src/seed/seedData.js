require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Service = require('../models/Service');
const Api = require('../models/Api');
const Environment = require('../models/Environment');
const Dependency = require('../models/Dependency');
const Deployment = require('../models/Deployment');
const HealthCheck = require('../models/HealthCheck');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { ROLES, SERVICE_STATUS, CRITICALITY, ENVIRONMENTS } = require('../config/constants');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhub';
    await mongoose.connect(mongoUri);
    console.log(' connected to MongoDB for seeding...');

    // Drop collections / database to reset indexes completely
    try {
      await mongoose.connection.db.dropDatabase();
      console.log(' Dropped existing devhub database.');
    } catch (e) {
      console.log(' Database already empty or new.');
    }

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'admin@devhub.io',
        password: 'Password123!',
        role: ROLES.ADMIN,
        title: 'Staff Platform Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sarah Chen',
        email: 'teamlead@devhub.io',
        password: 'Password123!',
        role: ROLES.TEAM_ADMIN,
        title: 'Payments Engineering Lead',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Marcus Vance',
        email: 'developer@devhub.io',
        password: 'Password123!',
        role: ROLES.DEVELOPER,
        title: 'Senior Backend Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Elena Rostova',
        email: 'viewer@devhub.io',
        password: 'Password123!',
        role: ROLES.VIEWER,
        title: 'Product Operations Analyst',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'David Kim',
        email: 'david.kim@devhub.io',
        password: 'Password123!',
        role: ROLES.DEVELOPER,
        title: 'Infrastructure & SRE Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    ]);

    const [adminUser, leadUser, devUser, viewerUser, infraUser] = users;
    console.log(` Created ${users.length} Users.`);

    // 2. Create Teams
    const teams = await Team.create([
      {
        name: 'Payments Team',
        key: 'payments',
        description: 'Owns transactional billing, checkout pipelines, credit card tokenization, and third-party bank gateways.',
        lead: leadUser._id,
        members: [leadUser._id, devUser._id],
        contactEmail: 'payments-eng@company.internal',
        slackChannel: '#team-payments'
      },
      {
        name: 'Commerce Team',
        key: 'commerce',
        description: 'Responsible for product catalogs, cart state, order management, and inventory synchronization.',
        lead: devUser._id,
        members: [devUser._id],
        contactEmail: 'commerce-devs@company.internal',
        slackChannel: '#team-commerce'
      },
      {
        name: 'Platform Team',
        key: 'platform',
        description: 'Core shared developer platform, asynchronous workers, messaging infrastructure, and event streaming.',
        lead: adminUser._id,
        members: [adminUser._id, devUser._id],
        contactEmail: 'platform-core@company.internal',
        slackChannel: '#team-platform'
      },
      {
        name: 'Security Team',
        key: 'security',
        description: 'Identity access management, JWT issuance, OAuth2 providers, role-based controls, and SOC2 compliance.',
        lead: adminUser._id,
        members: [adminUser._id],
        contactEmail: 'security-eng@company.internal',
        slackChannel: '#team-security'
      },
      {
        name: 'Infrastructure Team',
        key: 'infrastructure',
        description: 'Edge API Gateways, Service Mesh, DNS routing, Cloud environments, and telemetry instrumentation.',
        lead: infraUser._id,
        members: [infraUser._id, adminUser._id],
        contactEmail: 'infra-sre@company.internal',
        slackChannel: '#team-infra'
      }
    ]);

    const [paymentsTeam, commerceTeam, platformTeam, securityTeam, infraTeam] = teams;

    // Update user team links
    await User.findByIdAndUpdate(leadUser._id, { team: paymentsTeam._id });
    await User.findByIdAndUpdate(devUser._id, { team: commerceTeam._id });
    await User.findByIdAndUpdate(adminUser._id, { team: platformTeam._id });
    await User.findByIdAndUpdate(infraUser._id, { team: infraTeam._id });

    console.log(` Created ${teams.length} Teams.`);

    // 3. Create Services
    const services = await Service.create([
      {
        name: 'Payment Service',
        key: 'payment-service',
        description: 'Handles payment processing, card tokenization, refunds, and integration with Stripe & Bank APIs.',
        serviceType: 'Backend Service',
        ownerTeam: paymentsTeam._id,
        primaryOwner: leadUser._id,
        repositoryUrl: 'https://github.com/enterprise/payment-service',
        documentationUrl: 'https://docs.company.internal/services/payment-service',
        technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Stripe SDK'],
        language: 'TypeScript',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_1,
        tags: ['fintech', 'pci-dss', 'core-revenue', 'microservice'],
        createdBy: leadUser._id
      },
      {
        name: 'Order Service',
        key: 'order-service',
        description: 'Manages customer orders, checkout state transitions, invoice generation, and fulfillment tracking.',
        serviceType: 'Backend Service',
        ownerTeam: commerceTeam._id,
        primaryOwner: devUser._id,
        repositoryUrl: 'https://github.com/enterprise/order-service',
        documentationUrl: 'https://docs.company.internal/services/order-service',
        technologies: ['Go', 'Gin', 'PostgreSQL', 'Kafka', 'Docker'],
        language: 'Go',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_1,
        tags: ['commerce', 'high-throughput', 'orders'],
        createdBy: devUser._id
      },
      {
        name: 'Authentication Service',
        key: 'auth-service',
        description: 'Centralized OAuth2 / OpenID Connect provider for user login, SSO, JWT token signing, and session revocation.',
        serviceType: 'Backend Service',
        ownerTeam: securityTeam._id,
        primaryOwner: adminUser._id,
        repositoryUrl: 'https://github.com/enterprise/auth-service',
        documentationUrl: 'https://docs.company.internal/services/auth-service',
        technologies: ['TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'JWKS'],
        language: 'TypeScript',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_1,
        tags: ['security', 'auth', 'iam', 'sso'],
        createdBy: adminUser._id
      },
      {
        name: 'Notification Service',
        key: 'notification-service',
        description: 'High-throughput async notification dispatch via Email (SendGrid), SMS (Twilio), and Mobile Push notifications.',
        serviceType: 'Worker',
        ownerTeam: platformTeam._id,
        primaryOwner: adminUser._id,
        repositoryUrl: 'https://github.com/enterprise/notification-service',
        documentationUrl: 'https://docs.company.internal/services/notification-service',
        technologies: ['Python', 'FastAPI', 'Celery', 'RabbitMQ', 'Redis'],
        language: 'Python',
        status: SERVICE_STATUS.DEGRADED,
        criticality: CRITICALITY.TIER_2,
        tags: ['worker', 'messaging', 'async'],
        createdBy: adminUser._id
      },
      {
        name: 'Analytics Service',
        key: 'analytics-service',
        description: 'Aggregates real-time business telemetry, funnel metrics, user conversions, and nightly data warehouse sync.',
        serviceType: 'Scheduled Job',
        ownerTeam: platformTeam._id,
        primaryOwner: devUser._id,
        repositoryUrl: 'https://github.com/enterprise/analytics-service',
        documentationUrl: 'https://docs.company.internal/services/analytics-service',
        technologies: ['Python', 'ClickHouse', 'Apache Spark', 'Kafka'],
        language: 'Python',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_3,
        tags: ['data', 'analytics', 'reporting'],
        createdBy: devUser._id
      },
      {
        name: 'Inventory Service',
        key: 'inventory-service',
        description: 'Maintains SKU stock counts, multi-warehouse allocations, reservation locks, and low-stock replenishment alerts.',
        serviceType: 'Backend Service',
        ownerTeam: commerceTeam._id,
        primaryOwner: devUser._id,
        repositoryUrl: 'https://github.com/enterprise/inventory-service',
        documentationUrl: 'https://docs.company.internal/services/inventory-service',
        technologies: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'gRPC'],
        language: 'Java',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_2,
        tags: ['warehousing', 'stock', 'commerce'],
        createdBy: devUser._id
      },
      {
        name: 'Edge API Gateway',
        key: 'api-gateway',
        description: 'Single entry point for external traffic with rate limiting, SSL termination, path routing, and auth token validation.',
        serviceType: 'API',
        ownerTeam: infraTeam._id,
        primaryOwner: infraUser._id,
        repositoryUrl: 'https://github.com/enterprise/api-gateway',
        documentationUrl: 'https://docs.company.internal/services/api-gateway',
        technologies: ['Rust', 'Envoy', 'WebAssembly', 'Prometheus'],
        language: 'Rust',
        status: SERVICE_STATUS.HEALTHY,
        criticality: CRITICALITY.TIER_1,
        tags: ['edge', 'networking', 'gateway', 'proxy'],
        createdBy: infraUser._id
      },
      {
        name: 'Recommendation Engine',
        key: 'recommendation-engine',
        description: 'Machine learning model serving personalized product recommendations, related items, and search ranking.',
        serviceType: 'Backend Service',
        ownerTeam: commerceTeam._id,
        primaryOwner: devUser._id,
        repositoryUrl: 'https://github.com/enterprise/recommendation-engine',
        documentationUrl: 'https://docs.company.internal/services/recommendation-engine',
        technologies: ['Python', 'FastAPI', 'PyTorch', 'Qdrant Vector DB', 'Docker'],
        language: 'Python',
        status: SERVICE_STATUS.DOWN,
        criticality: CRITICALITY.TIER_3,
        tags: ['ai', 'ml', 'vector-search', 'recs'],
        createdBy: devUser._id
      }
    ]);

    const [paymentSvc, orderSvc, authSvc, notifSvc, analyticsSvc, inventorySvc, gatewaySvc, recsSvc] = services;
    console.log(` Created ${services.length} Services.`);

    // 4. Create Environments for all services
    const envDocs = [];
    for (const svc of services) {
      for (const envName of ENVIRONMENTS) {
        envDocs.push({
          name: envName,
          service: svc._id,
          baseUrl: `https://${svc.key}.${envName.toLowerCase()}.internal.devhub.io`,
          healthCheckUrl: `https://${svc.key}.${envName.toLowerCase()}.internal.devhub.io/health`,
          version: envName === 'Production' ? '2.4.1' : envName === 'Staging' ? '2.5.0-rc1' : '2.5.0-dev',
          deploymentStatus: svc.status === SERVICE_STATUS.DOWN && envName === 'Production' ? 'Down' : svc.status === SERVICE_STATUS.DEGRADED && envName === 'Production' ? 'Degraded' : 'Healthy',
          lastDeployedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5))
        });
      }
    }
    await Environment.insertMany(envDocs);
    console.log(` Created ${envDocs.length} Environments.`);

    // 5. Create APIs
    const apis = await Api.create([
      // Payment Service APIs
      {
        name: 'Process Charge',
        endpoint: '/api/v1/payments/charge',
        method: 'POST',
        version: 'v1',
        description: 'Authorizes and captures payment for an approved checkout transaction.',
        authRequired: true,
        status: 'Active',
        service: paymentSvc._id,
        exampleRequest: JSON.stringify({ orderId: 'ord_987654', amountCents: 4999, currency: 'USD', paymentMethodToken: 'tok_visa_4242' }, null, 2),
        exampleResponse: JSON.stringify({ transactionId: 'txn_10293847', status: 'succeeded', amountCaptured: 4999, receiptUrl: 'https://pay.internal/rec/10293847' }, null, 2)
      },
      {
        name: 'Get Transaction Status',
        endpoint: '/api/v1/payments/:id',
        method: 'GET',
        version: 'v1',
        description: 'Retrieves current ledger status, fees, and settlement confirmation for a transaction.',
        authRequired: true,
        status: 'Active',
        service: paymentSvc._id,
        exampleRequest: '{}',
        exampleResponse: JSON.stringify({ transactionId: 'txn_10293847', status: 'settled', orderId: 'ord_987654', createdAt: '2026-10-03T10:15:00Z' }, null, 2)
      },
      {
        name: 'Initiate Refund',
        endpoint: '/api/v1/payments/:id/refund',
        method: 'POST',
        version: 'v1',
        description: 'Issues full or partial credit refund back to the customer originating card.',
        authRequired: true,
        status: 'Active',
        service: paymentSvc._id,
        exampleRequest: JSON.stringify({ amountCents: 1500, reason: 'customer_requested' }, null, 2),
        exampleResponse: JSON.stringify({ refundId: 'ref_556677', status: 'processed', refundedAmount: 1500 }, null, 2)
      },

      // Order Service APIs
      {
        name: 'Create Customer Order',
        endpoint: '/api/v1/orders',
        method: 'POST',
        version: 'v1',
        description: 'Validates cart, reserves stock inventory, and triggers payment authorization.',
        authRequired: true,
        status: 'Active',
        service: orderSvc._id,
        exampleRequest: JSON.stringify({ customerId: 'usr_8811', items: [{ sku: 'SKU-LAPTOP-16', qty: 1, price: 1299 }], shippingAddressId: 'addr_33' }, null, 2),
        exampleResponse: JSON.stringify({ orderId: 'ord_987654', status: 'PENDING_PAYMENT', totalAmount: 1299.00 }, null, 2)
      },
      {
        name: 'Get Order by ID',
        endpoint: '/api/v1/orders/:id',
        method: 'GET',
        version: 'v1',
        description: 'Fetches order lifecycle state, line items, and fulfillment delivery tracking.',
        authRequired: true,
        status: 'Active',
        service: orderSvc._id,
        exampleRequest: '{}',
        exampleResponse: JSON.stringify({ orderId: 'ord_987654', status: 'PROCESSING', trackingNumber: 'TRK99881122' }, null, 2)
      },
      {
        name: 'Cancel Order',
        endpoint: '/api/v1/orders/:id/cancel',
        method: 'PUT',
        version: 'v1',
        description: 'Cancels unfulfilled order, releases reserved stock, and initiates reverse charge.',
        authRequired: true,
        status: 'Active',
        service: orderSvc._id,
        exampleRequest: JSON.stringify({ reason: 'buyer_cancelled' }, null, 2),
        exampleResponse: JSON.stringify({ orderId: 'ord_987654', status: 'CANCELLED', cancelledAt: '2026-10-03T11:00:00Z' }, null, 2)
      },

      // Auth Service APIs
      {
        name: 'Exchange Credentials for Token',
        endpoint: '/api/v1/auth/token',
        method: 'POST',
        version: 'v1',
        description: 'Issues signed RSA256 JWT access and refresh tokens for validated user identity.',
        authRequired: false,
        status: 'Active',
        service: authSvc._id,
        exampleRequest: JSON.stringify({ grantType: 'password', username: 'alex@company.com', password: '***' }, null, 2),
        exampleResponse: JSON.stringify({ accessToken: 'eyJhbGciOiJSUzI1Ni...', tokenType: 'Bearer', expiresIn: 3600 }, null, 2)
      },
      {
        name: 'Validate & Introspect Token',
        endpoint: '/api/v1/auth/introspect',
        method: 'POST',
        version: 'v1',
        description: 'Validates cryptographic signature, expiry, and permissions of a Bearer token.',
        authRequired: true,
        status: 'Active',
        service: authSvc._id,
        exampleRequest: JSON.stringify({ token: 'eyJhbGciOiJSUzI1Ni...' }, null, 2),
        exampleResponse: JSON.stringify({ active: true, sub: 'usr_8811', roles: ['DEVELOPER'], exp: 1791234567 }, null, 2)
      },

      // Notification Service APIs
      {
        name: 'Enqueue Multi-Channel Notification',
        endpoint: '/api/v1/notifications/send',
        method: 'POST',
        version: 'v1',
        description: 'Dispatches targeted template emails, SMS text alerts, or push notifications.',
        authRequired: true,
        status: 'Active',
        service: notifSvc._id,
        exampleRequest: JSON.stringify({ recipientEmail: 'user@example.com', templateId: 'order_shipped_v2', data: { orderId: 'ord_987654' } }, null, 2),
        exampleResponse: JSON.stringify({ messageId: 'msg_990011', status: 'queued', estimatedDeliverySec: 2 }, null, 2)
      },

      // Inventory Service APIs
      {
        name: 'Check SKU Stock Levels',
        endpoint: '/api/v1/inventory/stock/:sku',
        method: 'GET',
        version: 'v1',
        description: 'Returns real-time available, reserved, and warehouse-allocated unit counts.',
        authRequired: false,
        status: 'Active',
        service: inventorySvc._id,
        exampleRequest: '{}',
        exampleResponse: JSON.stringify({ sku: 'SKU-LAPTOP-16', availableUnits: 42, reservedUnits: 5, warehouse: 'US-EAST-1' }, null, 2)
      },
      {
        name: 'Reserve Item Stock',
        endpoint: '/api/v1/inventory/reserve',
        method: 'POST',
        version: 'v1',
        description: 'Locks inventory allocation with an automatic 15-minute checkout TTL window.',
        authRequired: true,
        status: 'Active',
        service: inventorySvc._id,
        exampleRequest: JSON.stringify({ sku: 'SKU-LAPTOP-16', qty: 1, reservationTtlSec: 900 }, null, 2),
        exampleResponse: JSON.stringify({ reservationId: 'res_445566', status: 'RESERVED', expiresAt: '2026-10-03T18:30:00Z' }, null, 2)
      },

      // Recommendation APIs
      {
        name: 'Get Personalized Recommendations',
        endpoint: '/api/v1/recommendations/user/:userId',
        method: 'GET',
        version: 'v1',
        description: 'Returns ML-ranked top-10 recommended product items based on user embedding vector.',
        authRequired: true,
        status: 'Active',
        service: recsSvc._id,
        exampleRequest: '{}',
        exampleResponse: JSON.stringify({ recommendations: [{ sku: 'SKU-MONITOR-4K', score: 0.94 }, { sku: 'SKU-KEYBOARD-MECH', score: 0.89 }] }, null, 2)
      }
    ]);
    console.log(` Created ${apis.length} API definitions.`);

    // 6. Create Service Dependencies
    const dependencies = await Dependency.create([
      {
        sourceService: orderSvc._id,
        targetService: paymentSvc._id,
        dependencyType: 'REST API',
        description: 'Synchronous payment authorization and settlement capture during checkout.',
        createdBy: devUser._id
      },
      {
        sourceService: orderSvc._id,
        targetService: inventorySvc._id,
        dependencyType: 'REST API',
        description: 'Stock availability verification and unit reservation before order creation.',
        createdBy: devUser._id
      },
      {
        sourceService: orderSvc._id,
        targetService: notifSvc._id,
        dependencyType: 'Message Queue',
        description: 'Asynchronous event publish on Order Placed / Shipped / Cancelled for customer alert.',
        createdBy: devUser._id
      },
      {
        sourceService: paymentSvc._id,
        targetService: authSvc._id,
        dependencyType: 'Authentication',
        description: 'Validates API client service token signatures before executing ledger transactions.',
        createdBy: leadUser._id
      },
      {
        sourceService: paymentSvc._id,
        targetService: notifSvc._id,
        dependencyType: 'Message Queue',
        description: 'Emits Payment Succeeded and Refund Initiated events for customer receipts.',
        createdBy: leadUser._id
      },
      {
        sourceService: gatewaySvc._id,
        targetService: authSvc._id,
        dependencyType: 'REST API',
        description: 'Validates inbound JWT Bearer tokens and checks rate limits at the perimeter.',
        createdBy: infraUser._id
      },
      {
        sourceService: gatewaySvc._id,
        targetService: orderSvc._id,
        dependencyType: 'REST API',
        description: 'Routes public /orders and /checkout endpoints downstream to order microservice.',
        createdBy: infraUser._id
      },
      {
        sourceService: gatewaySvc._id,
        targetService: paymentSvc._id,
        dependencyType: 'REST API',
        description: 'Proxies checkout tokenization requests securely.',
        createdBy: infraUser._id
      },
      {
        sourceService: gatewaySvc._id,
        targetService: inventorySvc._id,
        dependencyType: 'REST API',
        description: 'Exposes catalog stock checking endpoints.',
        createdBy: infraUser._id
      },
      {
        sourceService: recsSvc._id,
        targetService: orderSvc._id,
        dependencyType: 'Database',
        description: 'Reads order history and purchase affinity graphs for user embedding training.',
        createdBy: devUser._id
      },
      {
        sourceService: recsSvc._id,
        targetService: inventorySvc._id,
        dependencyType: 'REST API',
        description: 'Filters recommendations to only include items currently in stock.',
        createdBy: devUser._id
      },
      {
        sourceService: analyticsSvc._id,
        targetService: orderSvc._id,
        dependencyType: 'Message Queue',
        description: 'Consumes order events topic for revenue reporting and sales analytics.',
        createdBy: devUser._id
      },
      {
        sourceService: analyticsSvc._id,
        targetService: paymentSvc._id,
        dependencyType: 'Message Queue',
        description: 'Consumes payment transaction logs for gross merchandise value analysis.',
        createdBy: adminUser._id
      }
    ]);
    console.log(` Created ${dependencies.length} Service Dependencies.`);

    // 7. Create Deployments
    const deployments = await Deployment.create([
      {
        service: paymentSvc._id,
        environment: 'Production',
        version: 'v2.4.2',
        status: 'Successful',
        deployedBy: leadUser._id,
        commitHash: '8f92a1b',
        notes: 'Security patch: upgraded Stripe SDK v14 and added webhook idempotency check.',
        startedAt: new Date(Date.now() - 3600000 * 4),
        completedAt: new Date(Date.now() - 3600000 * 3.8)
      },
      {
        service: orderSvc._id,
        environment: 'Production',
        version: 'v3.1.0',
        status: 'Successful',
        deployedBy: devUser._id,
        commitHash: '3a11c8e',
        notes: 'Major performance release: optimized checkout transaction locks with Redis mutex.',
        startedAt: new Date(Date.now() - 3600000 * 12),
        completedAt: new Date(Date.now() - 3600000 * 11.7)
      },
      {
        service: notifSvc._id,
        environment: 'Production',
        version: 'v1.9.4',
        status: 'Failed',
        deployedBy: adminUser._id,
        commitHash: '5e44a99',
        notes: 'Attempted RabbitMQ cluster auto-failover configuration. Connection timeouts observed.',
        startedAt: new Date(Date.now() - 3600000 * 2),
        completedAt: new Date(Date.now() - 3600000 * 1.9)
      },
      {
        service: notifSvc._id,
        environment: 'Production',
        version: 'v1.9.3',
        status: 'Rolled Back',
        deployedBy: adminUser._id,
        commitHash: '2c99b77',
        notes: 'Rolled back v1.9.4 to stable v1.9.3 due to worker connection pool saturation.',
        startedAt: new Date(Date.now() - 3600000 * 1.5),
        completedAt: new Date(Date.now() - 3600000 * 1.4)
      },
      {
        service: recsSvc._id,
        environment: 'Production',
        version: 'v1.0.2',
        status: 'Failed',
        deployedBy: devUser._id,
        commitHash: '9b771e4',
        notes: 'PyTorch model weights memory allocation exceeded container limit (OOMKilled).',
        startedAt: new Date(Date.now() - 3600000 * 6),
        completedAt: new Date(Date.now() - 3600000 * 5.9)
      },
      {
        service: authSvc._id,
        environment: 'Staging',
        version: 'v2.0.0-rc2',
        status: 'Running',
        deployedBy: adminUser._id,
        commitHash: '4f22d61',
        notes: 'Deploying Passkey / WebAuthn passwordless authentication support for QA testing.',
        startedAt: new Date(Date.now() - 300000),
        completedAt: null
      },
      {
        service: gatewaySvc._id,
        environment: 'Production',
        version: 'v4.0.1',
        status: 'Successful',
        deployedBy: infraUser._id,
        commitHash: '1c44fa0',
        notes: 'Envoy dynamic route filters updated for European data sovereignty routing.',
        startedAt: new Date(Date.now() - 3600000 * 24),
        completedAt: new Date(Date.now() - 3600000 * 23.8)
      }
    ]);
    console.log(` Created ${deployments.length} Deployments.`);

    // 8. Create Health Checks
    const healthChecks = [];
    for (const svc of services) {
      for (let i = 0; i < 4; i++) {
        const isSvcDown = svc.status === SERVICE_STATUS.DOWN;
        const isSvcDegraded = svc.status === SERVICE_STATUS.DEGRADED;
        const timeOffset = i * 15 * 60 * 1000;

        healthChecks.push({
          service: svc._id,
          environment: 'Production',
          url: `https://${svc.key}.production.internal.devhub.io/health`,
          httpStatus: isSvcDown ? 503 : isSvcDegraded ? 429 : 200,
          responseTimeMs: isSvcDown ? 3200 : isSvcDegraded ? 680 : Math.floor(Math.random() * 60 + 20),
          status: svc.status,
          checkedAt: new Date(Date.now() - timeOffset),
          isSuccess: !isSvcDown,
          errorMessage: isSvcDown ? 'Connection timeout / 503 Service Unavailable' : isSvcDegraded ? 'High p99 latency > 650ms' : null
        });
      }
    }
    await HealthCheck.insertMany(healthChecks);
    console.log(` Created ${healthChecks.length} HealthCheck logs.`);

    // 9. Create Audit Logs
    await AuditLog.create([
      {
        user: leadUser._id,
        action: 'DEPLOYMENT_TRIGGER',
        entity: 'Deployment',
        entityId: deployments[0]._id.toString(),
        entityName: 'Payment Service (v2.4.2 to Production)',
        oldValue: { version: 'v2.4.1' },
        newValue: { version: 'v2.4.2', status: 'Successful' },
        timestamp: new Date(Date.now() - 3600000 * 4),
        ipAddress: '192.168.1.45'
      },
      {
        user: devUser._id,
        action: 'SERVICE_UPDATE',
        entity: 'Service',
        entityId: orderSvc._id.toString(),
        entityName: 'Order Service',
        oldValue: { status: 'Degraded' },
        newValue: { status: 'Healthy' },
        timestamp: new Date(Date.now() - 3600000 * 8),
        ipAddress: '192.168.1.88'
      },
      {
        user: adminUser._id,
        action: 'DEPENDENCY_ADD',
        entity: 'Dependency',
        entityId: dependencies[0]._id.toString(),
        entityName: 'Order Service -> Payment Service',
        newValue: { type: 'REST API' },
        timestamp: new Date(Date.now() - 3600000 * 16),
        ipAddress: '192.168.1.10'
      },
      {
        user: adminUser._id,
        action: 'TEAM_CREATE',
        entity: 'Team',
        entityId: paymentsTeam._id.toString(),
        entityName: 'Payments Team',
        newValue: { name: 'Payments Team', key: 'payments' },
        timestamp: new Date(Date.now() - 3600000 * 48),
        ipAddress: '192.168.1.10'
      }
    ]);
    console.log(' Created Audit Logs.');

    // 10. Create Notifications
    await Notification.create([
      {
        recipient: null, // Broadcast
        title: 'Health Alert: Recommendation Engine is Down',
        message: 'Recommendation Engine failed health checks with status code 503 (OOM). Immediate SRE triage required.',
        type: 'HEALTH_ALERT',
        relatedEntity: 'Service',
        relatedEntityId: recsSvc._id.toString(),
        readBy: []
      },
      {
        recipient: null,
        title: 'Deployment Succeeded: Payment Service v2.4.2',
        message: 'Sarah Chen deployed v2.4.2 to Production successfully.',
        type: 'DEPLOYMENT_STATUS',
        relatedEntity: 'Deployment',
        relatedEntityId: deployments[0]._id.toString(),
        readBy: [leadUser._id]
      },
      {
        recipient: devUser._id,
        title: 'Assigned as Primary Owner',
        message: 'You have been assigned as primary owner of Order Service and Inventory Service.',
        type: 'ASSIGNMENT',
        relatedEntity: 'Service',
        relatedEntityId: orderSvc._id.toString(),
        readBy: []
      },
      {
        recipient: null,
        title: 'New Dependency Added',
        message: 'Order Service now depends on Notification Service via Message Queue.',
        type: 'DEPENDENCY_CHANGE',
        relatedEntity: 'Dependency',
        relatedEntityId: dependencies[2]._id.toString(),
        readBy: [adminUser._id]
      }
    ]);
    console.log(' Created Notifications.');

    console.log('\n Database seeding finished successfully!');
    console.log('====================================================');
    console.log(' Demo Accounts Created:');
    console.log(' 1. ADMIN:      admin@devhub.io     / Password123!');
    console.log(' 2. TEAM_ADMIN: teamlead@devhub.io  / Password123!');
    console.log(' 3. DEVELOPER:  developer@devhub.io / Password123!');
    console.log(' 4. VIEWER:     viewer@devhub.io    / Password123!');
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
