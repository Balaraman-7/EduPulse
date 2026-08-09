import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    classesHeld: { type: Number, required: true, default: 1 },
    classesAttended: { type: Number, required: true, default: 1 },
    attendancePercentage: { type: Number, required: true }
  },
  { timestamps: true }
);

attendanceRecordSchema.pre('save', function (next) {
  if (this.classesHeld > 0) {
    this.attendancePercentage = Math.round((this.classesAttended / this.classesHeld) * 100);
  }
  next();
});

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
export default AttendanceRecord;
