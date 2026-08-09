import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Prediction from '../models/Prediction.js';
import CounsellingSession from '../models/CounsellingSession.js';
import Recommendation from '../models/Recommendation.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Backlog from '../models/Backlog.js';
import { getDropoutPrediction } from '../services/mlService.js';
import { generateGeminiRecommendations } from '../services/geminiService.js';

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/edupulse';
    const isCloudTarget = connStr.includes('mongodb+srv') || connStr.includes('mongodb.net');

    console.log('\n======================================================');
    console.log(`  [EduPulse Seed] Target: ${isCloudTarget ? '🌐 MONGODB ATLAS CLOUD' : '🏠 LOCAL MONGODB'}`);
    console.log('======================================================\n');

    let conn;
    try {
      conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 6000 });
    } catch (err) {
      if (isCloudTarget) {
        console.warn('⚠️ Cloud Atlas connection timed out (Campus Firewall / ISP Port 27017 Blocked).');
        console.warn('🔄 Falling back to Local MongoDB (mongodb://localhost:27017/edupulse)...');
        conn = await mongoose.connect('mongodb://localhost:27017/edupulse', { serverSelectionTimeoutMS: 5000 });
      } else {
        throw err;
      }
    }

    const connectedHost = conn.connection.host;
    const isActualCloud = connectedHost.includes('mongodb.net');

    console.log('\n======================================================');
    if (isActualCloud) {
      console.log('  🌐 CONNECTED TO MONGODB ATLAS CLOUD FOR SEEDING!     ');
    } else {
      console.log('  🏠 CONNECTED TO LOCAL MONGODB FOR SEEDING!           ');
    }
    console.log(`  Host Target: ${connectedHost}`);
    console.log('======================================================\n');

    // Clear existing collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Prediction.deleteMany({});
    await CounsellingSession.deleteMany({});
    await Recommendation.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Backlog.deleteMany({});

    console.log('[Seed] Cleared existing collection records.');

    // 1. Create Admin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@demo.local',
      passwordHash: 'admin123',
      role: 'ADMIN',
      department: 'Administration',
      phone: '+1 800-555-0100'
    });
    await admin.save();

    // 2. Create Faculty Users
    const faculty1 = new User({
      name: 'Dr. Robert Vance',
      email: 'faculty@demo.local',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      phone: '+1 800-555-0101'
    });
    await faculty1.save();

    const faculty2 = new User({
      name: 'Prof. Ananya Sharma',
      email: 'ananya.sharma@demo.local',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      department: 'Information Technology',
      phone: '+1 800-555-0102'
    });
    await faculty2.save();

    // 3. Create Departments
    const deptCSE = new Department({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Software Engineering',
      status: 'Active'
    });
    await deptCSE.save();

    const deptIT = new Department({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Systems & Web Technologies',
      status: 'Active'
    });
    await deptIT.save();

    const deptECE = new Department({
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics & Communication Engineering',
      status: 'Active'
    });
    await deptECE.save();

    // 4. Create Classes
    const classCseA = new Class({
      departmentId: deptCSE._id,
      name: 'CSE-A',
      code: 'CSE-A-2026',
      academicYear: '2026-27',
      semester: 4,
      section: 'A',
      facultyId: faculty1._id,
      status: 'Active'
    });
    await classCseA.save();

    const classCseB = new Class({
      departmentId: deptCSE._id,
      name: 'CSE-B',
      code: 'CSE-B-2026',
      academicYear: '2026-27',
      semester: 4,
      section: 'B',
      facultyId: faculty1._id,
      status: 'Active'
    });
    await classCseB.save();

    const classItA = new Class({
      departmentId: deptIT._id,
      name: 'IT-A',
      code: 'IT-A-2026',
      academicYear: '2026-27',
      semester: 6,
      section: 'A',
      facultyId: faculty2._id,
      status: 'Active'
    });
    await classItA.save();

    const classEceA = new Class({
      departmentId: deptECE._id,
      name: 'ECE-A',
      code: 'ECE-A-2026',
      academicYear: '2026-27',
      semester: 4,
      section: 'A',
      facultyId: faculty2._id,
      status: 'Active'
    });
    await classEceA.save();

    // 5. Create Primary Demo Student User
    const studentUserPrimary = new User({
      name: 'Alex Mercer',
      email: 'student@demo.local',
      passwordHash: 'student123',
      role: 'STUDENT',
      department: 'Computer Science & Engineering'
    });
    await studentUserPrimary.save();

    // Raw Students List
    const rawStudents = [
      {
        studentId: 'STU-2026-001',
        userId: studentUserPrimary._id,
        name: 'Alex Mercer',
        email: 'student@demo.local',
        rollNumber: '2026-CSE-01',
        admissionYear: 2024,
        departmentId: deptCSE._id,
        classId: classCseA._id,
        department: deptCSE.name,
        semester: 4,
        attendancePercentage: 58,
        internalMarks: 48,
        assignmentScore: 42,
        cgpa: 5.9,
        backlogCount: 3,
        previousSemesterPerformance: 52,
        feeStatus: 'Pending',
        familyIncomeCategory: 'Low',
        internetAccess: 'Yes',
        extracurricularParticipation: 'Low',
        facultyId: faculty1._id
      },
      {
        studentId: 'STU-2026-002',
        name: 'Samantha Reed',
        email: 'samantha.r@demo.local',
        rollNumber: '2026-CSE-02',
        admissionYear: 2024,
        departmentId: deptCSE._id,
        classId: classCseA._id,
        department: deptCSE.name,
        semester: 4,
        attendancePercentage: 42,
        internalMarks: 38,
        assignmentScore: 35,
        cgpa: 4.8,
        backlogCount: 5,
        previousSemesterPerformance: 45,
        feeStatus: 'Pending',
        familyIncomeCategory: 'Low',
        internetAccess: 'No',
        extracurricularParticipation: 'Low',
        facultyId: faculty1._id
      },
      {
        studentId: 'STU-2026-003',
        name: 'Jordan Lee',
        email: 'jordan.l@demo.local',
        rollNumber: '2026-IT-01',
        admissionYear: 2023,
        departmentId: deptIT._id,
        classId: classItA._id,
        department: deptIT.name,
        semester: 6,
        attendancePercentage: 88,
        internalMarks: 82,
        assignmentScore: 85,
        cgpa: 8.7,
        backlogCount: 0,
        previousSemesterPerformance: 86,
        feeStatus: 'Paid',
        familyIncomeCategory: 'High',
        internetAccess: 'Yes',
        extracurricularParticipation: 'High',
        facultyId: faculty2._id
      },
      {
        studentId: 'STU-2026-004',
        name: 'Marcus Chen',
        email: 'marcus.c@demo.local',
        rollNumber: '2026-CSE-04',
        admissionYear: 2024,
        departmentId: deptCSE._id,
        classId: classCseB._id,
        department: deptCSE.name,
        semester: 4,
        attendancePercentage: 64,
        internalMarks: 58,
        assignmentScore: 60,
        cgpa: 6.2,
        backlogCount: 2,
        previousSemesterPerformance: 62,
        feeStatus: 'Partial',
        familyIncomeCategory: 'Medium',
        internetAccess: 'Yes',
        extracurricularParticipation: 'Moderate',
        facultyId: faculty1._id
      },
      {
        studentId: 'STU-2026-005',
        name: 'Priya Patel',
        email: 'priya.p@demo.local',
        rollNumber: '2026-IT-05',
        admissionYear: 2023,
        departmentId: deptIT._id,
        classId: classItA._id,
        department: deptIT.name,
        semester: 6,
        attendancePercentage: 94,
        internalMarks: 91,
        assignmentScore: 92,
        cgpa: 9.3,
        backlogCount: 0,
        previousSemesterPerformance: 95,
        feeStatus: 'Paid',
        familyIncomeCategory: 'Medium',
        internetAccess: 'Yes',
        extracurricularParticipation: 'High',
        facultyId: faculty2._id
      },
      {
        studentId: 'STU-2026-006',
        name: 'David Taylor',
        email: 'david.t@demo.local',
        rollNumber: '2026-ECE-01',
        admissionYear: 2024,
        departmentId: deptECE._id,
        classId: classEceA._id,
        department: deptECE.name,
        semester: 4,
        attendancePercentage: 51,
        internalMarks: 44,
        assignmentScore: 48,
        cgpa: 5.4,
        backlogCount: 4,
        previousSemesterPerformance: 50,
        feeStatus: 'Pending',
        familyIncomeCategory: 'Low',
        internetAccess: 'Yes',
        extracurricularParticipation: 'Low',
        facultyId: faculty2._id
      }
    ];

    console.log('[Seed] Creating collections and seeding documents...');

    for (const raw of rawStudents) {
      let uId = raw.userId;
      if (!uId) {
        const u = new User({
          name: raw.name,
          email: raw.email,
          passwordHash: 'student123',
          role: 'STUDENT',
          department: raw.department
        });
        await u.save();
        uId = u._id;
      }

      const studentDoc = new Student({
        studentId: raw.studentId,
        userId: uId,
        name: raw.name,
        email: raw.email,
        rollNumber: raw.rollNumber,
        admissionYear: raw.admissionYear,
        departmentId: raw.departmentId,
        classId: raw.classId,
        department: raw.department,
        semester: raw.semester,
        attendancePercentage: raw.attendancePercentage,
        internalMarks: raw.internalMarks,
        assignmentScore: raw.assignmentScore,
        cgpa: raw.cgpa,
        backlogCount: raw.backlogCount,
        previousSemesterPerformance: raw.previousSemesterPerformance,
        feeStatus: raw.feeStatus,
        familyIncomeCategory: raw.familyIncomeCategory,
        internetAccess: raw.internetAccess,
        extracurricularParticipation: raw.extracurricularParticipation,
        facultyId: raw.facultyId,
        status: 'Active'
      });

      const mlRes = await getDropoutPrediction(studentDoc);
      studentDoc.riskScore = mlRes.riskScore;
      studentDoc.riskLevel = mlRes.riskLevel;
      await studentDoc.save();

      const dates = [
        new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      ];

      for (let i = 0; i < dates.length; i++) {
        let historicalScore = mlRes.riskScore;
        if (i === 0) historicalScore = Math.max(10, mlRes.riskScore - 15);
        if (i === 1) historicalScore = Math.max(15, mlRes.riskScore - 8);
        if (i === 2) historicalScore = Math.min(95, mlRes.riskScore + 5);

        let hLevel = 'Low';
        if (historicalScore >= 70) hLevel = 'High';
        else if (historicalScore >= 40) hLevel = 'Medium';

        const pred = new Prediction({
          studentId: studentDoc._id,
          riskScore: historicalScore,
          riskLevel: hLevel,
          prediction: historicalScore >= 50 ? 1 : 0,
          modelVersion: mlRes.modelVersion,
          predictionDate: dates[i],
          topFactors: mlRes.topFactors
        });
        await pred.save();
      }

      const attRecord = new AttendanceRecord({
        studentId: studentDoc._id,
        subject: 'Data Structures & Algorithms',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        classesHeld: 40,
        classesAttended: Math.round(40 * (raw.attendancePercentage / 100)),
        attendancePercentage: raw.attendancePercentage
      });
      await attRecord.save();

      const acadRecord1 = new AcademicRecord({
        studentId: studentDoc._id,
        semester: raw.semester,
        subject: 'Data Structures',
        assessmentType: 'Internal',
        assessmentName: 'Midterm Examination 1',
        marksObtained: raw.internalMarks,
        maximumMarks: 100,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });
      await acadRecord1.save();

      const acadRecord2 = new AcademicRecord({
        studentId: studentDoc._id,
        semester: raw.semester,
        subject: 'Database Management Systems',
        assessmentType: 'Assignment',
        assessmentName: 'Assignment 2 Submission',
        marksObtained: raw.assignmentScore,
        maximumMarks: 100,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      });
      await acadRecord2.save();

      if (raw.backlogCount > 0) {
        for (let b = 1; b <= raw.backlogCount; b++) {
          const backlog = new Backlog({
            studentId: studentDoc._id,
            subject: `Core Module Subject ${b}`,
            semester: raw.semester - 1,
            status: 'Active',
            attemptCount: 1
          });
          await backlog.save();
        }
      }

      const latestPred = await Prediction.findOne({ studentId: studentDoc._id }).sort({ predictionDate: -1 });
      const geminiRec = await generateGeminiRecommendations(studentDoc, latestPred);
      const rec = new Recommendation({
        studentId: studentDoc._id,
        predictionId: latestPred._id,
        generatedBy: 'Gemini AI',
        riskExplanation: geminiRec.riskExplanation,
        facultySuggestions: geminiRec.facultySuggestions,
        studentStudyPlan: geminiRec.studentStudyPlan,
        shortTermPlan: geminiRec.shortTermPlan,
        encouragingMessage: geminiRec.encouragingMessage
      });
      await rec.save();

      if (studentDoc.riskLevel === 'High' || studentDoc.riskLevel === 'Medium') {
        const session = new CounsellingSession({
          studentId: studentDoc._id,
          counsellorId: raw.facultyId,
          sessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          notes: `Initial check-in. Attendance is ${raw.attendancePercentage}% and active backlogs count is ${raw.backlogCount}. Formulated academic recovery goals.`,
          actionItems: [
            'Attend 100% of morning lecture sessions',
            'Weekly review with assigned faculty counsellor'
          ],
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: studentDoc.riskLevel === 'High' ? 'Intervention Active' : 'Under Review'
        });
        await session.save();
      }
    }

    console.log('\n======================================================');
    console.log(`  SUCCESS! SEEDED TO ${isActualCloud ? '🌐 MONGODB ATLAS CLOUD' : '🏠 LOCAL MONGODB'} `);
    console.log('======================================================');
    console.log('COLLECTIONS CREATED:');
    console.log('  1. users, 2. departments, 3. classes, 4. students, 5. predictions');
    console.log('  6. attendancerecords, 7. academicrecords, 8. backlogs');
    console.log('  9. counsellingsessions, 10. recommendations');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
