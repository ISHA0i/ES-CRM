const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.get('/', quotationController.getQuotations);
router.get('/:id', quotationController.getQuotationById);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);

// For dropdowns
router.get('/dropdown/clients', quotationController.getClients);
router.get('/dropdown/packages', quotationController.getPackages);
router.get('/dropdown/package-products/:packageId', quotationController.getPackageProducts);

// PDF generation
router.get('/:id/pdf', quotationController.generateQuotationPDF);

module.exports = router; 