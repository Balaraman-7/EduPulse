import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true, trim: true }, // e.g. "CSE-A"
    code: { type: String, required: true, trim: true }, // e.g. "CSE-A-2026"
    academicYear: { type: String, required: true, default: '2026-27' },
    semester: { type: Number, required: true, default: 4 },
    section: { type: String, default: 'A' },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);
export default Class;
