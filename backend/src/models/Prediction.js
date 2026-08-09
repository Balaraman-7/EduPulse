import mongoose from 'mongoose';

const topFactorSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    friendlyName: { type: String, default: '' },
    importance: { type: Number, required: true },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    riskScore: { type: Number, required: true }, // e.g. 82%
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    prediction: { type: Number, required: true }, // 0 (Stay) or 1 (Dropout Risk)
    modelVersion: { type: String, default: 'v1.0-RandomForest' },
    predictionDate: { type: Date, default: Date.now },
    topFactors: [topFactorSchema]
  },
  { timestamps: true }
);

const Prediction = mongoose.model('Prediction', predictionSchema);
export default Prediction;
