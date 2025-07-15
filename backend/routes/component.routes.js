const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');

router.get('/', componentController.getAll);
router.get('/:id', componentController.getById);
router.post('/', componentController.create);
router.put('/:id', componentController.update);
router.delete('/:id', componentController.remove);

module.exports = router; 