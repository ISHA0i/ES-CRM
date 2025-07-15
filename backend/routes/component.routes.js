const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', componentController.getAll);
router.get('/:id', componentController.getById);
router.post('/', upload.single('img'), componentController.create);
router.put('/:id', upload.single('img'), componentController.update);
router.delete('/:id', componentController.remove);

module.exports = router; 