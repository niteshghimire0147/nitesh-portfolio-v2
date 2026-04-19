import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    role:    { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    avatar:  { type: String, default: '' },
    approved:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
