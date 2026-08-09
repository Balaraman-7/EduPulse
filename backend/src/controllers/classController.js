import Class from '../models/Class.js';
import Department from '../models/Department.js';
import Student from '../models/Student.js';

export const getClasses = async (req, res) => {
  try {
    const { departmentId, facultyId } = req.query;
    let query = {};

    if (departmentId) query.departmentId = departmentId;
    if (facultyId) query.facultyId = facultyId;

    if (req.user.role === 'FACULTY' && !facultyId) {
      query.facultyId = req.user._id;
    }

    const classes = await Class.find(query)
      .populate('departmentId', 'name code')
      .populate('facultyId', 'name email department')
      .sort({ name: 1 });

    const enriched = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id, status: 'Active' });
        return {
          ...cls.toObject(),
          studentCount
        };
      })
    );

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('departmentId', 'name code description')
      .populate('facultyId', 'name email department phone');

    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const students = await Student.find({ classId: cls._id, status: 'Active' })
      .populate('facultyId', 'name email')
      .sort({ riskScore: -1 });

    const highRisk = students.filter(s => s.riskLevel === 'High').length;
    const mediumRisk = students.filter(s => s.riskLevel === 'Medium').length;
    const lowRisk = students.filter(s => s.riskLevel === 'Low').length;

    return res.json({
      class: cls,
      students,
      stats: {
        total: students.length,
        highRisk,
        mediumRisk,
        lowRisk
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { departmentId, name, code, academicYear, semester, section, facultyId, status } = req.body;

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: 'Parent Department not found' });

    const newClass = new Class({
      departmentId,
      name,
      code: code || `${dept.code}-${name}`,
      academicYear: academicYear || '2026-27',
      semester: Number(semester) || 4,
      section: section || 'A',
      facultyId: facultyId || null,
      status: status || 'Active'
    });

    await newClass.save();
    return res.status(201).json(newClass);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    Object.assign(cls, req.body);
    await cls.save();

    return res.json(cls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    cls.status = 'Inactive';
    await cls.save();

    return res.json({ message: 'Class status set to Inactive', class: cls });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
