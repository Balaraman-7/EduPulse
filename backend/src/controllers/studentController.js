import Student from '../models/Student.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Class from '../models/Class.js';
import Prediction from '../models/Prediction.js';
import { getDropoutPrediction } from '../services/mlService.js';

export const getStudents = async (req, res) => {
  try {
    const { departmentId, department, classId, riskLevel, search, semester } = req.query;
    let query = { status: 'Active' };

    // If role is FACULTY, filter by assigned facultyId unless Admin
    if (req.user.role === 'FACULTY') {
      query.facultyId = req.user._id;
    }

    if (departmentId && departmentId !== 'All') {
      query.departmentId = departmentId;
    } else if (department && department !== 'All') {
      query.department = { $regex: department, $options: 'i' };
    }
    if (classId && classId !== 'All') {
      query.classId = classId;
    }
    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }
    if (riskLevel && riskLevel !== 'All') {
      query.riskLevel = riskLevel;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('departmentId', 'name code')
      .populate('classId', 'name code academicYear semester section')
      .populate('facultyId', 'name email department')
      .sort({ riskScore: -1 });

    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('departmentId', 'name code description')
      .populate('classId', 'name code academicYear semester section')
      .populate('facultyId', 'name email department phone')
      .populate('userId', 'name email role');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Role check: STUDENT can only view own profile
    if (req.user.role === 'STUDENT' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view another student profile' });
    }

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const {
      name, email, password, phone, rollNumber, admissionYear,
      departmentId, classId, gender,
      attendancePercentage, internalMarks, assignmentScore, cgpa,
      backlogCount, previousSemesterPerformance, feeStatus,
      familyIncomeCategory, internetAccess, extracurricularParticipation,
      facultyId
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate Department & Class
    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(400).json({ message: 'Invalid Department selected' });

    let cls = classId ? await Class.findById(classId) : null;
    if (!cls || cls.departmentId.toString() !== dept._id.toString()) {
      cls = await Class.findOne({ departmentId: dept._id });
    }
    if (!cls) {
      cls = new Class({
        departmentId: dept._id,
        name: `${dept.code}-A`,
        code: `${dept.code}-A-2026`,
        academicYear: '2026-27',
        semester: 4,
        section: 'A',
        status: 'Active'
      });
      await cls.save();
    }

    // Create user account
    const user = new User({
      name,
      email,
      passwordHash: password || 'student123',
      role: 'STUDENT',
      department: dept.name,
      phone
    });
    await user.save();

    const studentCount = await Student.countDocuments();
    const studentId = req.body.studentId || `STU-${2026}-${String(studentCount + 101).padStart(3, '0')}`;

    const student = new Student({
      studentId,
      userId: user._id,
      name,
      email,
      phone,
      rollNumber: rollNumber || '',
      admissionYear: Number(admissionYear) || 2026,
      departmentId: dept._id,
      classId: cls._id,
      department: dept.name,
      semester: cls.semester || 4,
      gender: gender || 'Male',
      attendancePercentage: Number(attendancePercentage) || 75,
      internalMarks: Number(internalMarks) || 65,
      assignmentScore: Number(assignmentScore) || 70,
      cgpa: Number(cgpa) || 7.0,
      backlogCount: Number(backlogCount) || 0,
      previousSemesterPerformance: Number(previousSemesterPerformance) || 70,
      feeStatus: feeStatus || 'Paid',
      familyIncomeCategory: familyIncomeCategory || 'Medium',
      internetAccess: internetAccess || 'Yes',
      extracurricularParticipation: extracurricularParticipation || 'Moderate',
      facultyId: facultyId || cls.facultyId || null,
      status: 'Active'
    });

    // Run ML Risk Prediction
    const mlResult = await getDropoutPrediction(student);
    student.riskScore = mlResult.riskScore;
    student.riskLevel = mlResult.riskLevel;
    student.lastPredictedAt = new Date();

    await student.save();

    // Save Prediction record
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

    return res.status(201).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    Object.assign(student, req.body);

    if (req.body.departmentId && req.body.classId) {
      const dept = await Department.findById(req.body.departmentId);
      const cls = await Class.findById(req.body.classId);
      if (dept) student.department = dept.name;
      if (cls) student.semester = cls.semester;
    }

    // Re-run ML Prediction upon metric updates
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

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.status = 'Inactive';
    await student.save();

    return res.json({ message: 'Student status set to Inactive (Historical records preserved)', student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const transferStudentClass = async (req, res) => {
  try {
    const { studentId, targetClassId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const targetClass = await Class.findById(targetClassId);
    if (!targetClass) return res.status(404).json({ message: 'Target class not found' });

    student.classId = targetClass._id;
    student.departmentId = targetClass.departmentId;
    student.semester = targetClass.semester;
    if (targetClass.facultyId) student.facultyId = targetClass.facultyId;

    await student.save();
    return res.json({ message: 'Student transferred successfully to new class', student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const assignFaculty = async (req, res) => {
  try {
    const { studentId, facultyId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.facultyId = facultyId;
    await student.save();

    return res.json({ message: 'Faculty assigned successfully', student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
