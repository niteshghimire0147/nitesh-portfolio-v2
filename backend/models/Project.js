import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack:   { type: [String], default: [] },
    category:    { type: String, default: 'Development', trim: true, index: true },
    githubUrl:   { type: String, default: '' },
    liveUrl:     { type: String, default: '' },
    image:       { type: String, default: '' },
    featured:    { type: Boolean, default: false, index: true },
    order:       { type: Number, default: 0 },
    deleted:     { type: Boolean, default: false, index: true },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
