const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits']
  },
  password: {
    type: String,
    required: function() {
      // Password required only for email/mobile auth, not for Google OAuth
      return this.authProvider !== 'google';
    },
    minlength: [8, 'Password must be at least 8 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  userType: {
    type: String,
    enum: ['individual', 'business', 'admin', 'warehouse_manager', 'logistics_partner'],
    required: [true, 'User type is required'],
    default: 'individual'
  },
  // Warehouse Manager fields (formerly pickup_member)
  warehouseManagerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  },
  warehouseManagerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  warehouseManagerApprovedAt: {
    type: Date
  },
  warehouseManagerRejectionReason: {
    type: String
  },
  // Logistics Partner fields (new)
  logisticsPartnerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  },
  logisticsPartnerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  logisticsPartnerApprovedAt: {
    type: Date
  },
  logisticsPartnerRejectionReason: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'mobile'],
    required: [true, 'Auth provider is required'],
    default: 'email'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  active: {
    type: Boolean,
    default: true
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance (userType only — email/mobile/googleId already indexed via unique:true)
userSchema.index({ userType: 1 });
userSchema.index({ warehouseManagerStatus: 1 });
userSchema.index({ logisticsPartnerStatus: 1 });

// Instance method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (!this.accountLockedUntil) return false;
  return this.accountLockedUntil > new Date();
};

// Instance method to increment failed login attempts
userSchema.methods.incrementFailedAttempts = async function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  await this.save();
};

// Instance method to reset failed login attempts
userSchema.methods.resetFailedAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  await this.save();
};

// Don't return password in JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
