const mongoose = require('mongoose');

const servicePackageSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleType',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true, uppercase: true, default: 'PKR' },
    features: [{ type: String, trim: true }],
    durationMinutes: { type: Number, min: 1, default: 60 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

servicePackageSchema.index({ vehicleTypeId: 1, sortOrder: 1, basePrice: 1 });

module.exports = mongoose.model('ServicePackage', servicePackageSchema);
