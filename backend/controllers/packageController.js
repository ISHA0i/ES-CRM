const Package = require('../models/package');
const PackageProduct = require('../models/packageProduct');
const Component = require('../models/component');
const Inventory = require('../models/inventory');

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const { name, type, products } = req.body; // products: [{component_id, product_id, quantity}]
    const pkg = await Package.create({ name, type });
    if (Array.isArray(products)) {
      for (const p of products) {
        await PackageProduct.create({
          package_id: pkg.id,
          component_id: p.component_id,
          product_id: p.product_id,
          quantity: p.quantity || 1,
        });
      }
    }
    res.status(201).json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all packages (optionally filter by type)
exports.getPackages = async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};
    const packages = await Package.findAll({ where });
    // For each package, get products
    const result = [];
    for (const pkg of packages) {
      const products = await PackageProduct.findAll({ where: { package_id: pkg.id } });
      result.push({ ...pkg.toJSON(), products });
    }
    res.json({ success: true, packages: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single package by id (with products)
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    const products = await PackageProduct.findAll({ where: { package_id: pkg.id } });
    res.json({ success: true, package: { ...pkg.toJSON(), products } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a package (name/type/products)
exports.updatePackage = async (req, res) => {
  try {
    const { name, type, products } = req.body;
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    await pkg.update({ name, type });
    // Remove old products and add new
    await PackageProduct.destroy({ where: { package_id: pkg.id } });
    if (Array.isArray(products)) {
      for (const p of products) {
        await PackageProduct.create({
          package_id: pkg.id,
          component_id: p.component_id,
          product_id: p.product_id,
          quantity: p.quantity || 1,
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    await PackageProduct.destroy({ where: { package_id: pkg.id } });
    await pkg.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 