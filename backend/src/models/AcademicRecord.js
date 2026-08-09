import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true, default: 4 },
    subject: { type: String, required: true },
    assessmentType: {
      type: String,
      enum: ['Internal', 'Assignment', 'Quiz', 'Practical', 'Midterm', 'End Semester'],
      default: 'Internal'
    },
    assessmentName: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maximumMarks: { type: Number, required: true, default: 100 },
    date: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
export default AcademicRecord;
