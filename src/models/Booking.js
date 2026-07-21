const mongoose = require('mongoose');

const addonSnapshotSchema = new mongoose.Schema(
  {
    addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Addon', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const vehicleSnapshotSchema = new mongoose.Schema(
  {
    vehicleType: {
      vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType', required: true },
      code: { type: String, required: true },
      name: { type: String, required: true },
      priceModifier: { type: Number, required: true, min: 0 },
    },
    servicePackage: {
      packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePackage', required: true },
      code: { type: String, required: true },
      name: { type: String, required: true },
      basePrice: { type: Number, required: true, min: 0 },
    },
    addons: { type: [addonSnapshotSchema], default: [] },
    makeAndModel: { type: String, trim: true, default: '' },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, uppercase: true, index: true },
    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    serviceDate: { type: String, required: true, index: true },
    timeSlot: {
      timeSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
      code: { type: String, required: true },
      title: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    vehicles: {
      type: [vehicleSnapshotSchema],
      required: true,
      validate: [(value) => value.length > 0, 'At least one vehicle is required'],
    },
    numberOfCars: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, uppercase: true, default: 'PKR' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank', 'card'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    note: { type: String, trim: true, default: '' },
    adminNote: { type: String, trim: true, default: '' },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ serviceDate: 1, 'timeSlot.code': 1, status: 1 });
bookingSchema.index({ 'customer.phone': 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
