import mongoose from 'mongoose';

const backlogSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    semester: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Cleared'], default: 'Active' },
    attemptCount: { type: Number, default: 1 },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

const Backlog = mongoose.model('Backlog', backlogSchema);
export default Backlog;
