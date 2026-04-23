const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index - MongoDB will automatically delete documents when expiresAt is reached
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create a new session
sessionSchema.statics.createSession = async function(userId, token, expiresIn = '24h') {
  // Calculate expiration time
  const expirationMs = expiresIn === '24h' ? 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expirationMs);

  const session = await this.create({
    userId,
    token,
    expiresAt
  });

  return session;
};

// Static method to find valid session
sessionSchema.statics.findValidSession = async function(token) {
  const session = await this.findOne({
    token,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  return session;
};

// Static method to invalidate session (logout)
sessionSchema.statics.invalidateSession = async function(token) {
  await this.deleteOne({ token });
};

// Static method to invalidate all user sessions
sessionSchema.statics.invalidateUserSessions = async function(userId) {
  await this.deleteMany({ userId });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
