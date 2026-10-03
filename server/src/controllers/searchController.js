const Service = require('../models/Service');
const Team = require('../models/Team');
const Api = require('../models/Api');

// @desc    Global search across Services, Teams, and APIs
// @route   GET /api/search
// @access  Private
exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        results: {
          services: [],
          teams: [],
          apis: []
        }
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [services, teams, apis] = await Promise.all([
      Service.find({
        $or: [
          { name: regex },
          { key: regex },
          { description: regex },
          { technologies: { $in: [regex] } },
          { language: regex }
        ]
      })
        .populate('ownerTeam', 'name key')
        .limit(8),

      Team.find({
        $or: [{ name: regex }, { key: regex }, { description: regex }]
      })
        .populate('lead', 'name email avatar')
        .limit(6),

      Api.find({
        $or: [{ name: regex }, { endpoint: regex }, { description: regex }]
      })
        .populate('service', 'name key status')
        .limit(8)
    ]);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        services,
        teams,
        apis,
        totalMatches: services.length + teams.length + apis.length
      }
    });
  } catch (error) {
    next(error);
  }
};
