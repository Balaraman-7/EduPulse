import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    admissionYear: { type: Number, default: 2026 },
    
    // Dynamic Academic Hierarchy References
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    department: { type: String, default: 'Computer Science' },
    semester: { type: Number, required: true, default: 4 },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'], default: 'Male' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    
    // Aggregated / Current Performance Metrics (Calculated dynamically from Records)
    attendancePercentage: { type: Number, required: true, min: 0, max: 100, default: 75 },
    internalMarks: { type: Number, required: true, min: 0, max: 100, default: 65 },
    assignmentScore: { type: Number, required: true, min: 0, max: 100, default: 70 },
    cgpa: { type: Number, required: true, min: 0, max: 10, default: 7.0 },
    backlogCount: { type: Number, required: true, min: 0, default: 0 },
    previousSemesterPerformance: { type: Number, required: true, min: 0, max: 100, default: 70 },
    
    // Indicators
    feeStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Paid' },
    familyIncomeCategory: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    internetAccess: { type: String, enum: ['Yes', 'No'], default: 'Yes' },
    extracurricularParticipation: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
    previousCounsellingCount: { type: Number, default: 0 },
    
    // Faculty Assignment
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // ML Status
    riskScore: { type: Number, default: 20 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    lastPredictedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
