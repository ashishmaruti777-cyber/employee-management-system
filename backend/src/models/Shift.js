const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  breakMinutes: { type: Number, default: 60 },
  gracePeriodMinutes: { type: Number, default: 15 },
  overtimeThresholdHours: { type: Number, default: 8 },
  isNightShift: { type: Boolean, default: false },
  color: { type: String, default: '#10b981' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
