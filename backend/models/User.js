import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    password: { type: String, required: true, minlength: 8 },
    twoFactorEnabled:       { type: Boolean, default: false },
    twoFactorSecret:        { type: String,  default: null },
    twoFactorPendingSecret: { type: String,  default: null },
    passwordChangedAt:      { type: Date,    default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
