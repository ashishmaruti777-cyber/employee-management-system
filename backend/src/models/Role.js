const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  permissions: [{
    module: { type: String, required: true },
    actions: [{ type: String, enum: ['create', 'read', 'update', 'delete', 'export'] }],
  }],
  color: { type: String, default: '#4f46e5' },
  isActive: { type: Boolean, default: true },
  userCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
