import AttendanceRecord from '../models/AttendanceRecord.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Backlog from '../models/Backlog.js';
import Student from '../models/Student.js';
import Prediction from '../models/Prediction.js';
import { getDropoutPrediction } from '../services/mlService.js';

// Attendance Record Logger
export const addAttendanceRecord = async (req, res) => {
  try {
    const { studentId, subject, date, classesHeld, classesAttended } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const record = new AttendanceRecord({
      studentId,
      subject,
      date: date || new Date(),
      classesHeld: Number(classesHeld) || 1,
      classesAttended: Number(classesAttended) || 1
    });
    await record.save();

    // Recompute student overall attendance percentage from all records
    const allRecords = await AttendanceRecord.find({ studentId });
    const totalHeld = allRecords.reduce((acc, r) => acc + r.classesHeld, 0);
    const totalAttended = allRecords.reduce((acc, r) => acc + r.classesAttended, 0);

    if (totalHeld > 0) {
      student.attendancePercentage = Math.round((totalAttended / totalHeld) * 100);
    }

    // Re-run ML Prediction automatically
    const mlResult = await getDropoutPrediction(student);
    student.riskScore = mlResult.riskScore;
    student.riskLevel = mlResult.riskLevel;
    student.lastPredictedAt = new Date();
    await student.save();

    // Save Prediction snapshot
    const pred = new Prediction({
      studentId: student._id,
      riskScore: mlResult.riskScore,
      riskLevel: mlResult.riskLevel,
      prediction: mlResult.prediction,
      modelVersion: mlResult.modelVersion,
      predictionDate: new Date(),
      topFactors: mlResult.topFactors
    });
    await pred.save();

    return res.status(201).json({ record, student, prediction: pred });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Assessment Marks Logger
export const addAcademicRecord = async (req, res) => {
  try {
    const { studentId, semester, subject, assessmentType, assessmentName, marksObtained, maximumMarks, date } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const record = new AcademicRecord({
      studentId,
      semester: semester || student.semester,
      subject,
      assessmentType: assessmentType || 'Internal',
      assessmentName,
      marksObtained: Number(marksObtained),
      maximumMarks: Number(maximumMarks) || 100,
      date: date || new Date()
    });
    await record.save();

    // Recompute overall internals / assignment score
    const allAcademics = await AcademicRecord.find({ studentId });
    const internals = allAcademics.filter(a => a.assessmentType === 'Internal' || a.assessmentType === 'Midterm');
    const assignments = allAcademics.filter(a => a.assessmentType === 'Assignment' || a.assessmentType === 'Quiz');

    if (internals.length > 0) {
      const avgInternal = internals.reduce((acc, i) => acc + (i.marksObtained / i.maximumMarks * 100), 0) / internals.length;
      student.internalMarks = Math.round(avgInternal);
    }

    if (assignments.length > 0) {
      const avgAssign = assignments.reduce((acc, a) => acc + (a.marksObtained / a.maximumMarks * 100), 0) / assignments.length;
      student.assignmentScore = Math.round(avgAssign);
    }

    // Re-run ML Prediction
    const mlResult = await getDropoutPrediction(student);
    student.riskScore = mlResult.riskScore;
    student.riskLevel = mlResult.riskLevel;
    student.lastPredictedAt = new Date();
    await student.save();

    const pred = new Prediction({
      studentId: student._id,
      riskScore: mlResult.riskScore,
      riskLevel: mlResult.riskLevel,
      prediction: mlResult.prediction,
      modelVersion: mlResult.modelVersion,
      predictionDate: new Date(),
      topFactors: mlResult.topFactors
    });
    await pred.save();

    return res.status(201).json({ record, student, prediction: pred });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Backlog Logger & Resolver
export const addOrUpdateBacklog = async (req, res) => {
  try {
    const { studentId, backlogId, subject, semester, status } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let item;
    if (backlogId) {
      item = await Backlog.findById(backlogId);
      if (item) {
        if (status) item.status = status;
        if (status === 'Cleared') item.resolvedAt = new Date();
        await item.save();
      }
    } else {
      item = new Backlog({
        studentId,
        subject,
        semester: semester || student.semester,
        status: status || 'Active'
      });
      await item.save();
    }

    // Update active backlog count on Student
    const activeCount = await Backlog.countDocuments({ studentId, status: 'Active' });
    student.backlogCount = activeCount;

    // Re-run ML Prediction
    const mlResult = await getDropoutPrediction(student);
    student.riskScore = mlResult.riskScore;
    student.riskLevel = mlResult.riskLevel;
    student.lastPredictedAt = new Date();
    await student.save();

    const pred = new Prediction({
      studentId: student._id,
      riskScore: mlResult.riskScore,
      riskLevel: mlResult.riskLevel,
      prediction: mlResult.prediction,
      modelVersion: mlResult.modelVersion,
      predictionDate: new Date(),
      topFactors: mlResult.topFactors
    });
    await pred.save();

    return res.status(200).json({ item, student, prediction: pred });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fetch Student Historical Records for Dashboard Trends
export const getStudentAcademicHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendance = await AttendanceRecord.find({ studentId }).sort({ date: 1 });
    const academics = await AcademicRecord.find({ studentId }).sort({ date: 1 });
    const backlogs = await Backlog.find({ studentId }).sort({ createdAt: 1 });
    const predictions = await Prediction.find({ studentId }).sort({ createdAt: 1 });

    return res.json({
      attendance,
      academics,
      backlogs,
      predictions
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
