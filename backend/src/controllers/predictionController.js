import Prediction from '../models/Prediction.js';
import Student from '../models/Student.js';
import { getDropoutPrediction } from '../services/mlService.js';

export const runPrediction = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const mlResult = await getDropoutPrediction(student);

    student.riskScore = mlResult.riskScore;
    student.riskLevel = mlResult.riskLevel;
    student.lastPredictedAt = new Date();
    await student.save();

    const prediction = new Prediction({
      studentId: student._id,
      riskScore: mlResult.riskScore,
      riskLevel: mlResult.riskLevel,
      prediction: mlResult.prediction,
      modelVersion: mlResult.modelVersion,
      topFactors: mlResult.topFactors
    });
    await prediction.save();

    return res.json({ student, prediction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.json(predictions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHighRiskStudents = async (req, res) => {
  try {
    let query = { riskLevel: 'High' };
    if (req.user.role === 'FACULTY') {
      query.facultyId = req.user._id;
    }
    const highRiskStudents = await Student.find(query).populate('facultyId', 'name email').sort({ riskScore: -1 });
    return res.json(highRiskStudents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
