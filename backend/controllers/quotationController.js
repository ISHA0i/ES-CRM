const Quotation = require('../models/quotation');
const QuotationProduct = require('../models/quotationProduct');
const Client = require('../models/client');
const Package = require('../models/package');
const PackageProduct = require('../models/packageProduct');
const Component = require('../models/component');
const Inventory = require('../models/inventory');
const PdfPrinter = require('pdfmake');
const path = require('path');
const fonts = {
  RobotoMono: {
    normal: path.join(__dirname, '../fonts/RobotoMono-VariableFont_wght.ttf'),
    bold: path.join(__dirname, '../fonts/RobotoMono-VariableFont_wght.ttf'),
    italics: path.join(__dirname, '../fonts/RobotoMono-Italic-VariableFont_wght.ttf'),
    bolditalics: path.join(__dirname, '../fonts/RobotoMono-Italic-VariableFont_wght.ttf'),
  }
};
const printer = new PdfPrinter(fonts);
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

// Generate PDF for a quotation (styled to match sample image)
exports.generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    const client = await Client.findByPk(quotation.client_id);
    const products = await QuotationProduct.findAll({ where: { quotation_id: quotation.id } });
    const detailedProducts = await Promise.all(products.map(async (p) => {
      const component = await Component.findByPk(p.product_id);
      return {
        ...p.toJSON(),
        product_name: component ? component.product_name : '',
        model: component ? component.model : '',
        unit_price: component ? component.unit_price : '',
        availability: component ? component.availability : '',
        description: component ? component.description : '',
      };
    }));

    // Calculate totals
    let total = 0;
    detailedProducts.forEach((p) => {
      total += (parseFloat(p.unit_price) || 0) * (parseInt(p.quantity) || 1);
    });
    const gst = Math.round(total * 0.18);
    const totalWithGst = Math.round(total + gst);

    // Build product table body
    const tableBody = [
      [
        { text: 'NO.', style: 'tableHeader' },
        { text: 'DISCRIPTION', style: 'tableHeader' },
        { text: 'QTY', style: 'tableHeader' },
        { text: 'AMOUNT', style: 'tableHeader' }
      ],
      ...detailedProducts.map((p, idx) => [
        { text: `${idx + 1}`, style: 'tableCell' },
        {
          text: [
            (p.product_name ? p.product_name + '\n' : ''),
            (p.model ? p.model + '\n' : ''),
            (p.description ? p.description + '\n' : ''),
          ],
          style: 'tableCell'
        },
        { text: `${p.quantity}`, style: 'tableCell', alignment: 'center' },
        { text: `${p.unit_price}`, style: 'tableCell', alignment: 'right', color: '#b00' }
      ])
    ];

    // Compose docDefinition
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header
        {
          text: 'HEM INFOTECH',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'F-08 KRISHNA CON-ARCH,NEAR POST OFFICE,UNIVERSITY ROAD,RAJKOT 9429044588',
          style: 'address',
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'AS-48 KAILASH COMPLEX, KAILASH BAUG ROAD, GONDAL 9924271610',
          style: 'address',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        // TO section
        {
          text: `TO${client ? '\n' + client.name : ''}${client && client.email ? '\n' + client.email : ''}${client && client.phone ? '\n' + client.phone : ''}`,
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        // Date and Subject
        {
          columns: [
            {
              text: `DT ${new Date().toLocaleDateString('en-GB')}`,
              style: 'normalText'
            },
            {
              text: 'QUOTATION',
              style: 'quotationHeader',
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: 'SUB :->',
          style: 'normalText',
          margin: [0, 0, 0, 5]
        },
        {
          text: quotation.custom_name ? quotation.custom_name : 'SYSTEM QUOTATION',
          style: 'normalText',
          margin: [0, 0, 0, 20]
        },
        // Table
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: tableBody
          },
          layout: {
            hLineWidth: function (i, node) { return 1; },
            vLineWidth: function (i, node) { return 1; },
            hLineColor: function (i, node) { return '#000000'; },
            vLineColor: function (i, node) { return '#000000'; }
          },
          margin: [0, 0, 0, 20]
        },
        // Pricing details
        {
          columns: [
            { text: '', width: '*' },
            {
              width: 200,
              stack: [
                {
                  text: `PRICE WITHOUT GST    ${total.toLocaleString()}`,
                  style: 'priceText',
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },
                {
                  text: `GST 18%    ${gst.toLocaleString()}`,
                  style: 'priceText',
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },
                {
                  text: `ALL RATES ARE INCLUSIVE WITH TAX    TOTAL ${totalWithGst.toLocaleString()}`,
                  style: 'totalText',
                  alignment: 'right',
                  margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },
        // Warranty
        {
          text: 'WARRANTY 1 YEAR Standard as per company',
          style: 'normalText',
          margin: [0, 0, 0, 10]
        },
        // GST and Email
        {
          text: 'GST NO:->24AAMFP0310N1Z0',
          style: 'normalText',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'EMAIL HEMINFOTECH2006@GMAIL.COM',
          style: 'normalText',
          margin: [0, 0, 0, 10]
        },
        // Bank Details
        {
          text: 'OUR BANK DETAIL :->',
          style: 'normalText',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'BANK KOTAK MAHINDRA BANK IFSC CODE :-> KKBK0002788',
          style: 'normalText',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'AC NO. 0112622916 - CURRENT ACCOUNT BRANCH GONDAL',
          style: 'normalText',
          margin: [0, 0, 0, 15]
        },
        // Terms and Conditions
        {
          text: 'Term &Condition:->',
          style: 'normalText',
          margin: [0, 0, 0, 5]
        },
        {
          text: '* Rates are valid for 7 days only.',
          style: 'normalText',
          margin: [0, 0, 0, 3]
        },
        {
          text: '* Transportation : Extra as Actual Applicable.',
          style: 'normalText',
          margin: [0, 0, 0, 3]
        },
        {
          text: '* Payment only 100% advance',
          style: 'normalText',
          margin: [0, 0, 0, 3]
        },
        {
          text: '* Delivery within 2days after conform order.',
          style: 'normalText',
          margin: [0, 0, 0, 15]
        },
        // Footer
        {
          text: 'FOR HEM INFOTECH',
          style: 'normalText',
          alignment: 'right',
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          font: 'RobotoMono'
        },
        address: {
          fontSize: 10,
          font: 'RobotoMono'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          font: 'RobotoMono'
        },
        quotationHeader: {
          fontSize: 14,
          bold: true,
          font: 'RobotoMono'
        },
        normalText: {
          fontSize: 10,
          font: 'RobotoMono'
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          font: 'RobotoMono',
          alignment: 'center'
        },
        tableCell: {
          fontSize: 9,
          font: 'RobotoMono'
        },
        priceText: {
          fontSize: 10,
          font: 'RobotoMono'
        },
        totalText: {
          fontSize: 10,
          bold: true,
          font: 'RobotoMono'
        }
      },
      defaultStyle: {
        font: 'RobotoMono'
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation_${quotation.id}.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 