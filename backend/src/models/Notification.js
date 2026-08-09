import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['HIGH_RISK_ALERT', 'COUNSELLING_SCHEDULED', 'STATUS_UPDATE', 'SYSTEM'], required: true },
    message: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
