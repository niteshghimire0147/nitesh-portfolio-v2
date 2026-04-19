import mongoose from 'mongoose';

const ctfSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    platform:   { type: String, required: true, trim: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Insane'], required: true, index: true },
    category:   { type: String, required: true, trim: true, index: true },
    excerpt:    { type: String, required: true },
    content:    { type: String, required: true, maxlength: 500000 },
    tags:       { type: [String], default: [] },
    points:     { type: Number, default: 0 },
    published:  { type: Boolean, default: false, index: true },
    solvedAt:   { type: Date, default: Date.now },
    deleted:    { type: Boolean, default: false, index: true },
    deletedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-purge soft-deleted documents after 30 days
ctfSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { deleted: true } });

export default mongoose.model('CTF', ctfSchema);
