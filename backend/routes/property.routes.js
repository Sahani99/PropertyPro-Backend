const express = require('express');
const router = express.Router();
const controller = require('../controllers/property.controller');

router.get('/', controller.getAllProperties);
router.get('/:id', controller.getPropertyById);
router.post('/', controller.createProperty);
router.put('/:id', controller.updateProperty);
router.delete('/:id', controller.deleteProperty);

module.exports = router;
