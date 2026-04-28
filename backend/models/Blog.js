import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt:   { type: String, required: true },
    content:   { type: String, required: true, maxlength: 500000 },
    tags:      { type: [String], default: [] },
    category:  { type: String, default: 'General', trim: true, index: true },
    published: { type: Boolean, default: false, index: true },
    views:     { type: Number, default: 0 },
    pdfUrl:    { type: String, default: null },
    deleted:   { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-purge soft-deleted documents after 30 days
blogSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { deleted: true } });

export default mongoose.model('Blog', blogSchema);
