import Student from '../models/Student.js';
import Prediction from '../models/Prediction.js';
import Recommendation from '../models/Recommendation.js';
import { generateGeminiRecommendations, generateGeminiChatResponse } from '../services/geminiService.js';

export const getStudentRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if recent recommendation exists
    let recommendation = await Recommendation.findOne({ studentId }).sort({ createdAt: -1 });

    if (!recommendation) {
      // Find latest prediction
      let prediction = await Prediction.findOne({ studentId }).sort({ createdAt: -1 });
      if (!prediction) {
        prediction = {
          riskScore: student.riskScore,
          riskLevel: student.riskLevel,
          topFactors: [
            { feature: 'attendancePercentage', friendlyName: 'Attendance Monitor', importance: 0.3 }
          ]
        };
      }

      const geminiResult = await generateGeminiRecommendations(student, prediction);

      recommendation = new Recommendation({
        studentId: student._id,
        predictionId: prediction._id || null,
        generatedBy: 'Gemini AI',
        riskExplanation: geminiResult.riskExplanation,
        facultySuggestions: geminiResult.facultySuggestions,
        studentStudyPlan: geminiResult.studentStudyPlan,
        shortTermPlan: geminiResult.shortTermPlan,
        encouragingMessage: geminiResult.encouragingMessage
      });

      await recommendation.save();
    }

    return res.json(recommendation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refreshRecommendations = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let prediction = await Prediction.findOne({ studentId }).sort({ createdAt: -1 });
    if (!prediction) {
      prediction = {
        riskScore: student.riskScore,
        riskLevel: student.riskLevel,
        topFactors: [{ feature: 'attendancePercentage', friendlyName: 'Low Attendance Rate', importance: 0.3 }]
      };
    }

    const geminiResult = await generateGeminiRecommendations(student, prediction);

    const recommendation = new Recommendation({
      studentId: student._id,
      predictionId: prediction._id || null,
      generatedBy: 'Gemini AI',
      riskExplanation: geminiResult.riskExplanation,
      facultySuggestions: geminiResult.facultySuggestions,
      studentStudyPlan: geminiResult.studentStudyPlan,
      shortTermPlan: geminiResult.shortTermPlan,
      encouragingMessage: geminiResult.encouragingMessage
    });

    await recommendation.save();
    return res.json(recommendation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const chatWithAICounsellor = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    
    let student = null;
    if (req.user && req.user.role === 'STUDENT') {
      student = await Student.findOne({ userId: req.user._id });
    }

    const replyText = await generateGeminiChatResponse(student, message, chatHistory);

    return res.json({
      reply: replyText,
      timestamp: new Date()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
