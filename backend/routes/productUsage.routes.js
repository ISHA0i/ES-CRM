const express = require('express');
const router = express.Router();
const productUsageController = require('../controllers/productUsageController');

router.get('/', productUsageController.getAll);
router.get('/:id', productUsageController.getById);
router.post('/', productUsageController.create);
router.put('/:id', productUsageController.update);
router.delete('/:id', productUsageController.remove);

module.exports = router; 