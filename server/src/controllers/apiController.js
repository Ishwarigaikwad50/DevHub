const Api = require('../models/Api');
const Service = require('../models/Service');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all APIs with filters
// @route   GET /api/apis
// @access  Private
exports.getApis = async (req, res, next) => {
  try {
    const { method, search, service, authRequired, status } = req.query;
    const query = {};

    if (method) query.method = method.toUpperCase();
    if (service) query.service = service;
    if (status) query.status = status;
    if (authRequired !== undefined) query.authRequired = authRequired === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { endpoint: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const apis = await Api.find(query)
      .populate({
        path: 'service',
        select: 'name key status ownerTeam',
        populate: { path: 'ownerTeam', select: 'name key' }
      })
      .sort({ endpoint: 1 });

    res.status(200).json({
      success: true,
      count: apis.length,
      apis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single API detail
// @route   GET /api/apis/:id
// @access  Private
exports.getApi = async (req, res, next) => {
  try {
    const api = await Api.findById(req.params.id).populate({
      path: 'service',
      select: 'name key status ownerTeam documentationUrl',
      populate: { path: 'ownerTeam', select: 'name key lead' }
    });

    if (!api) {
      return res.status(404).json({ success: false, message: 'API definition not found' });
    }

    res.status(200).json({ success: true, api });
  } catch (error) {
    next(error);
  }
};

// @desc    Create API definition
// @route   POST /api/apis
// @access  Private (Admin, Team Admin, Developer)
exports.createApi = async (req, res, next) => {
  try {
    const { name, endpoint, method, version, description, authRequired, status, service, exampleRequest, exampleResponse } = req.body;

    const svc = await Service.findById(service);
    if (!svc) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const existing = await Api.findOne({ endpoint, method: method.toUpperCase(), service });
    if (existing) {
      return res.status(409).json({ success: false, message: `Endpoint ${method.toUpperCase()} ${endpoint} already exists for this service.` });
    }

    const api = await Api.create({
      name,
      endpoint,
      method: method.toUpperCase(),
      version: version || 'v1',
      description,
      authRequired: authRequired !== undefined ? authRequired : true,
      status: status || 'Active',
      service,
      exampleRequest: exampleRequest || '{\n  \n}',
      exampleResponse: exampleResponse || '{\n  "status": "success"\n}'
    });

    await logAudit({
      req,
      action: 'API_CREATE',
      entity: 'API',
      entityId: api._id,
      entityName: `${api.method} ${api.endpoint}`,
      newValue: { name: api.name, endpoint: api.endpoint, method: api.method, service: svc.name },
      notify: true,
      notificationTitle: `New API Registered: ${api.method} ${api.endpoint}`,
      notificationType: 'SYSTEM'
    });

    res.status(201).json({ success: true, api });
  } catch (error) {
    next(error);
  }
};

// @desc    Update API definition
// @route   PUT /api/apis/:id
// @access  Private (Admin, Team Admin, Developer)
exports.updateApi = async (req, res, next) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ success: false, message: 'API definition not found' });
    }

    const oldValue = { name: api.name, endpoint: api.endpoint, method: api.method, status: api.status };

    const { name, endpoint, method, version, description, authRequired, status, exampleRequest, exampleResponse } = req.body;

    if (name) api.name = name;
    if (endpoint) api.endpoint = endpoint;
    if (method) api.method = method.toUpperCase();
    if (version) api.version = version;
    if (description !== undefined) api.description = description;
    if (authRequired !== undefined) api.authRequired = authRequired;
    if (status) api.status = status;
    if (exampleRequest !== undefined) api.exampleRequest = exampleRequest;
    if (exampleResponse !== undefined) api.exampleResponse = exampleResponse;

    await api.save();

    await logAudit({
      req,
      action: 'API_UPDATE',
      entity: 'API',
      entityId: api._id,
      entityName: `${api.method} ${api.endpoint}`,
      oldValue,
      newValue: { name: api.name, endpoint: api.endpoint, method: api.method, status: api.status }
    });

    res.status(200).json({ success: true, api });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete API definition
// @route   DELETE /api/apis/:id
// @access  Private (Admin, Team Admin, Developer)
exports.deleteApi = async (req, res, next) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ success: false, message: 'API not found' });
    }

    await Api.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'API_DELETE',
      entity: 'API',
      entityId: api._id,
      entityName: `${api.method} ${api.endpoint}`
    });

    res.status(200).json({ success: true, message: 'API definition deleted successfully' });
  } catch (error) {
    next(error);
  }
};
