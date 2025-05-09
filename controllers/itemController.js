const Item = require('../models/Item');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all items
 * @route   GET /api/items
 * @access  Public
 */
exports.getItems = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single item
 * @route   GET /api/items/:id
 * @access  Public
 */
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate({
    path: 'owner',
    select: 'name email phone'
  });

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private
 */
exports.createItem = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.owner = req.user.id;

  const item = await Item.create(req.body);

  res.status(201).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private
 */
exports.updateItem = asyncHandler(async (req, res, next) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is item owner
  if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this item`,
        403
      )
    );
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private
 */
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is item owner
  if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this item`,
        403
      )
    );
  }

  await item.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get items within radius
 * @route   GET /api/items/radius/:zipcode/:distance
 * @access  Public
 */
exports.getItemsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const items = await Item.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});