import mongoose from 'mongoose';

const counsellingSessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, required: true },
    actionItems: [{ type: String }],
    followUpDate: { type: Date },
    status: {
      type: String,
      enum: [
        'New Alert',
        'Under Review',
        'Counselling Scheduled',
        'Intervention Active',
        'Improving',
        'Monitoring',
        'Resolved'
      ],
      default: 'Under Review'
    }
  },
  { timestamps: true }
);

const CounsellingSession = mongoose.model('CounsellingSession', counsellingSessionSchema);
export default CounsellingSession;
