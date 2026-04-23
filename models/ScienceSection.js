const mongoose = require('mongoose');

const scienceSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 4
  },
  layout: {
    type: String,
    required: true,
    enum: ['layout1', 'layout2', 'layout3', 'layout4'],
    default: 'layout1'
  },
  content: {
    mainText: {
      type: String,
      trim: true
    },
    bulletPoints: [{
      type: String,
      trim: true
    }],
    additionalText: {
      type: String,
      trim: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      enum: ['left', 'right', 'top', 'bottom', 'center'],
      default: 'left'
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#0f172a'
  }
}, {
  timestamps: true
});

// Ensure order is unique and within range
scienceSectionSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('ScienceSection', scienceSectionSchema);
