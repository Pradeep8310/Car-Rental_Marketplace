const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'electronics',
        'furniture',
        'clothing',
        'sports',
        'tools',
        'vehicles',
        'other'
      ]
    },
    price: {
      type: Number,
      required: [true, 'Please add a daily rental price']
    },
    deposit: {
      type: Number,
      required: [true, 'Please add a security deposit amount']
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      address: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    images: [String],
    availability: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create index for location
ItemSchema.index({ location: '2dsphere' });

// Virtual for item reviews
ItemSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'item',
  justOne: false
});

module.exports = mongoose.model('Item', ItemSchema);