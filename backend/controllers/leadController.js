const Lead = require('../models/lead');

exports.getLeads = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const { rows, count } = await Lead.findAndCountAll({
      offset,
      limit: pageSize,
      order: [['id', 'DESC']]
    });
    res.json({ leads: rows, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const [updated] = await Lead.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
