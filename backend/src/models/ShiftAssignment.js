const mongoose = require('mongoose');

const shiftAssignmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  recurring: { type: Boolean, default: false },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  status: { type: String, enum: ['active', 'inactive', 'swap-pending'], default: 'active' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
}, { timestamps: true });

shiftAssignmentSchema.index({ employee: 1, startDate: 1 });

module.exports = mongoose.model('ShiftAssignment', shiftAssignmentSchema);
