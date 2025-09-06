const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Indexes are automatically created for unique fields
// No need to add explicit indexes for username and email since they're unique

module.exports = mongoose.model('User', userSchema);
