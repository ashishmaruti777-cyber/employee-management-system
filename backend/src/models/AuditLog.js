const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true, 
    enum: ['create', 'update', 'delete', 'toggle'] 
  },
  entity: { 
    type: String, 
    required: true, 
    enum: ['role', 'user', 'employee', 'department', 'attendance', 'payroll', 'settings', 'shift'] 
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityName: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  oldValues: { type: mongoose.Schema.Types.Mixed, default: {} },
  newValues: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
