const mongoose = require('mongoose');

const loginRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mobile: { type: String, required: true },
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  hr: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hrName: { type: String, default: '' },
  rejectReason: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  loginTime: { type: Date },
}, { timestamps: true });

loginRequestSchema.index({ status: 1, createdAt: -1 });
loginRequestSchema.index({ employee: 1 });

module.exports = mongoose.model('LoginRequest', loginRequestSchema);
