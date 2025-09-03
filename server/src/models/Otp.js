const mongoose = require('mongoose');
const { Schema } = mongoose;

const OtpSchema = new Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', OtpSchema);
