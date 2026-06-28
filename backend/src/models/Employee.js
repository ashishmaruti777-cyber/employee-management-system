const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },

  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },

  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  position: { type: String, required: true },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'intern'], default: 'full-time' },
  joinDate: { type: Date, required: true },
  salary: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'inactive', 'on-leave', 'terminated'], default: 'active' },
  profileImage: { type: String, default: '' },

  reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null, set: function(v) { return (v === '' || v === null || v === undefined) ? null : v; } },
  workShift: { type: String, enum: ['morning', 'afternoon', 'night', 'flexible'], default: 'morning' },
  probationEndDate: { type: Date, default: null },
  contractEndDate: { type: Date, default: null },

  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
  },

  bankDetails: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    branch: { type: String, default: '' },
  },

  documents: {
    aadharNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    passportNumber: { type: String, default: '' },
    drivingLicense: { type: String, default: '' },
  },

  personalInfo: {
    nationality: { type: String, default: '' },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed', ''], default: '' },
    bloodGroup: { type: String, default: '' },
    religion: { type: String, default: '' },
  },

  education: {
    highestDegree: { type: String, default: '' },
    institution: { type: String, default: '' },
    yearOfPassing: { type: Number, default: null },
    percentage: { type: String, default: '' },
  },

  experience: {
    totalYears: { type: Number, default: 0 },
    previousCompany: { type: String, default: '' },
    previousPosition: { type: String, default: '' },
  },

  skills: [{ type: String }],

  notes: { type: String, default: '' },
}, { timestamps: true });

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
