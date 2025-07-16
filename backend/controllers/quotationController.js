const Quotation = require('../models/quotation');
const QuotationProduct = require('../models/quotationProduct');
const Client = require('../models/client');
const Package = require('../models/package');
const PackageProduct = require('../models/packageProduct');
const Component = require('../models/component');
const Inventory = require('../models/inventory');
// const PDFDocument = require('pdfkit'); // For future PDF generation

// Get all quotations
exports.getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name'] },
        { model: Package, as: 'package', attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']]
    });
    // Map to include client_name and package_name at top level for frontend
    const result = quotations.map(q => {
      const qObj = q.toJSON();
      return {
        ...qObj,
        client_name: qObj.client ? qObj.client.name : '',
        package_name: qObj.package ? qObj.package.name : '',
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single quotation by ID (with products)
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    const products = await QuotationProduct.findAll({ where: { quotation_id: quotation.id } });
    // Fetch full product details for each
    const detailedProducts = await Promise.all(products.map(async (p) => {
      const component = await Component.findByPk(p.product_id); // product_id refers to component.id
      return {
        ...p.toJSON(),
        product_name: component ? component.product_name : '',
        model: component ? component.model : '',
        unit_price: component ? component.unit_price : '',
        availability: component ? component.availability : '',
        description: component ? component.description : '',
      };
    }));
    res.json({ ...quotation.toJSON(), products: detailedProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new quotation
exports.createQuotation = async (req, res) => {
  try {
    const { client_id, package_id, custom_name, custom_type, products } = req.body;
    // Calculate total price
    let total_price = 0;
    products.forEach(p => {
      total_price += (p.unit_price || 0) * (p.quantity || 1);
    });
    const quotation = await Quotation.create({ client_id, package_id, custom_name, custom_type, total_price });
    // Save products
    for (const p of products) {
      await QuotationProduct.create({
        quotation_id: quotation.id,
        component_id: p.component_id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price,
      });
    }
    res.status(201).json({ id: quotation.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a quotation (products can be replaced)
exports.updateQuotation = async (req, res) => {
  try {
    const { custom_name, custom_type, products } = req.body;
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    // Update quotation
    let total_price = 0;
    products.forEach(p => {
      total_price += (p.unit_price || 0) * (p.quantity || 1);
    });
    await quotation.update({ custom_name, custom_type, total_price });
    // Remove old products and add new
    await QuotationProduct.destroy({ where: { quotation_id: quotation.id } });
    for (const p of products) {
      await QuotationProduct.create({
        quotation_id: quotation.id,
        component_id: p.component_id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price,
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a quotation
exports.deleteQuotation = async (req, res) => {
  try {
    await Quotation.destroy({ where: { id: req.params.id } });
    await QuotationProduct.destroy({ where: { quotation_id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all clients (for dropdown)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all packages (for dropdown)
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products for a package (for editing)
exports.getPackageProducts = async (req, res) => {
  try {
    const products = await PackageProduct.findAll({ where: { package_id: req.params.packageId } });
    // Fetch full product details for each
    const detailedProducts = await Promise.all(products.map(async (p) => {
      const component = await Component.findByPk(p.product_id); // product_id refers to component.id
      return {
        ...p.toJSON(),
        product_name: component ? component.product_name : '',
        model: component ? component.model : '',
        unit_price: component ? component.unit_price : '',
        availability: component ? component.availability : '',
        total_quantity: component ? component.total_quantity : '',
        description: component ? component.description : '',
      };
    }));
    res.json(detailedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate PDF for a quotation (stub)
exports.generateQuotationPDF = async (req, res) => {
  // TODO: Implement PDF generation
  res.status(501).json({ error: 'PDF generation not implemented yet' });
}; 