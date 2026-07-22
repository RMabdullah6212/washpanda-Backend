const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    altText: { type: String, trim: true, maxlength: 200, default: '' },
    mediaType: { type: String, enum: ['image', 'video'], required: true, index: true },
    mediaUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true, default: '' },
    publicId: { type: String, required: true, unique: true, trim: true },
    resourceType: { type: String, enum: ['image', 'video'], required: true },
    format: { type: String, trim: true, default: '' },
    width: { type: Number, min: 0, default: 0 },
    height: { type: Number, min: 0, default: 0 },
    duration: { type: Number, min: 0, default: 0 },
    bytes: { type: Number, min: 0, default: 0 },
    sortOrder: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

galleryItemSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
galleryItemSchema.index({ isActive: 1, mediaType: 1, createdAt: -1 });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
