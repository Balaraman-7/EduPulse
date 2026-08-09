import Department from '../models/Department.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Enrich with dynamic class and student counts
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const classCount = await Class.countDocuments({ departmentId: dept._id, status: 'Active' });
        const studentCount = await Student.countDocuments({ departmentId: dept._id, status: 'Active' });
        return {
          ...dept.toObject(),
          classCount,
          studentCount
        };
      })
    );

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    const classes = await Class.find({ departmentId: dept._id })
      .populate('facultyId', 'name email department')
      .sort({ name: 1 });

    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const students = await Student.find({ classId: cls._id, status: 'Active' });
        const highRisk = students.filter(s => s.riskLevel === 'High').length;
        const mediumRisk = students.filter(s => s.riskLevel === 'Medium').length;
        const lowRisk = students.filter(s => s.riskLevel === 'Low').length;

        return {
          ...cls.toObject(),
          studentCount: students.length,
          highRisk,
          mediumRisk,
          lowRisk
        };
      })
    );

    const totalStudents = await Student.countDocuments({ departmentId: dept._id, status: 'Active' });

    return res.json({
      department: dept,
      classes: enrichedClasses,
      totalStudents
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    
    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Department code '${code.toUpperCase()}' already exists` });
    }

    const dept = new Department({
      name,
      code: code.toUpperCase(),
      description: description || '',
      status: status || 'Active'
    });

    await dept.save();
    return res.status(201).json(dept);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    Object.assign(dept, req.body);
    if (req.body.code) dept.code = req.body.code.toUpperCase();

    await dept.save();
    return res.json(dept);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    dept.status = 'Inactive';
    await dept.save();

    return res.json({ message: 'Department status updated to Inactive', department: dept });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
