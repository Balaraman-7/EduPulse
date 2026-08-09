import Student from '../models/Student.js';
import CounsellingSession from '../models/CounsellingSession.js';

export const getSystemOverviewAnalytics = async (req, res) => {
  try {
    const students = await Student.find();
    
    const totalStudents = students.length;
    const highRisk = students.filter(s => s.riskLevel === 'High').length;
    const mediumRisk = students.filter(s => s.riskLevel === 'Medium').length;
    const lowRisk = students.filter(s => s.riskLevel === 'Low').length;

    const activeInterventions = await CounsellingSession.countDocuments({
      status: { $in: ['Intervention Active', 'Counselling Scheduled', 'Under Review'] }
    });

    const improvingStudents = await CounsellingSession.countDocuments({
      status: 'Improving'
    });

    // Risk Distribution for Pie Chart
    const riskDistribution = [
      { name: 'Low Risk', value: lowRisk, color: '#10B981' },
      { name: 'Medium Risk', value: mediumRisk, color: '#F59E0B' },
      { name: 'High Risk', value: highRisk, color: '#EF4444' }
    ];

    // Department-wise distribution
    const deptMap = {};
    students.forEach(s => {
      const dept = s.department || 'Computer Science';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
      }
      deptMap[dept].total += 1;
      if (s.riskLevel === 'High') deptMap[dept].highRisk += 1;
      else if (s.riskLevel === 'Medium') deptMap[dept].mediumRisk += 1;
      else deptMap[dept].lowRisk += 1;
    });

    const departmentStats = Object.values(deptMap);

    // Semester-wise distribution
    const semMap = {};
    students.forEach(s => {
      const sem = `Sem ${s.semester}`;
      if (!semMap[sem]) {
        semMap[sem] = { semester: sem, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
      }
      if (s.riskLevel === 'High') semMap[sem].highRisk += 1;
      else if (s.riskLevel === 'Medium') semMap[sem].mediumRisk += 1;
      else semMap[sem].lowRisk += 1;
    });

    const semesterStats = Object.values(semMap).sort((a, b) => a.semester.localeCompare(b.semester));

    // Attendance vs Risk data sample
    const attendanceVsRisk = students.slice(0, 50).map(s => ({
      name: s.name,
      attendance: s.attendancePercentage,
      riskScore: s.riskScore,
      cgpa: s.cgpa
    }));

    // CGPA vs Risk data sample
    const cgpaVsRisk = students.slice(0, 50).map(s => ({
      name: s.name,
      cgpa: s.cgpa,
      riskScore: s.riskScore,
      backlogs: s.backlogCount
    }));

    // Monthly Intervention trend sample
    const interventionTrend = [
      { month: 'Jan', newAlerts: 12, resolved: 8 },
      { month: 'Feb', newAlerts: 18, resolved: 14 },
      { month: 'Mar', newAlerts: 15, resolved: 11 },
      { month: 'Apr', newAlerts: 22, resolved: 19 },
      { month: 'May', newAlerts: 10, resolved: 15 },
      { month: 'Jun', newAlerts: 8, resolved: 12 }
    ];

    return res.json({
      summary: {
        totalStudents,
        highRisk,
        mediumRisk,
        lowRisk,
        activeInterventions,
        improvingStudents
      },
      riskDistribution,
      departmentStats,
      semesterStats,
      attendanceVsRisk,
      cgpaVsRisk,
      interventionTrend
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
