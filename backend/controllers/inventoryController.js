const Inventory = require('../models/inventory');

exports.getAll = async (req, res) => {
  try {
    const items = await Inventory.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.img = `/uploads/${req.file.filename}`;
    }
    const item = await Inventory.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.img = `/uploads/${req.file.filename}`;
    }
    const [updated] = await Inventory.update(data, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    const item = await Inventory.findByPk(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Inventory.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 