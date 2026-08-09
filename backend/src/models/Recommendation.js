import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    predictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
    generatedBy: { type: String, enum: ['Gemini AI', 'Rules Engine', 'Manual'], default: 'Gemini AI' },
    riskExplanation: { type: String, required: true },
    facultySuggestions: [{ type: String }],
    studentStudyPlan: [{ type: String }],
    shortTermPlan: [{ type: String }],
    encouragingMessage: { type: String, default: '' },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
