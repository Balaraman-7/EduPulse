import User from '../models/User.js';
import Student from '../models/Student.js';

export const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'FACULTY' }).select('-passwordHash');
    return res.json(faculty);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const faculty = new User({
      name,
      email,
      passwordHash: password || 'faculty123',
      role: 'FACULTY',
      department: department || 'Computer Science',
      phone: phone || ''
    });
    await faculty.save();

    return res.status(201).json(faculty);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyAssignedStudents = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const students = await Student.find({ facultyId }).sort({ riskScore: -1 });

    const stats = {
      total: students.length,
      highRisk: students.filter(s => s.riskLevel === 'High').length,
      mediumRisk: students.filter(s => s.riskLevel === 'Medium').length,
      lowRisk: students.filter(s => s.riskLevel === 'Low').length
    };

    return res.json({ stats, students });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
