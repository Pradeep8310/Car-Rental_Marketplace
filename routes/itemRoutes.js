const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemsInRadius
} = require('../controllers/itemController');

const Item = require('../models/Item');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.route('/radius/:zipcode/:distance').get(getItemsInRadius);

router
  .route('/')
  .get(advancedResults(Item, 'owner'), getItems)
  .post(protect, createItem);

router
  .route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;