import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const getDropoutPrediction = async (studentData) => {
  try {
    const payload = {
      features: {
        attendancePercentage: studentData.attendancePercentage,
        internalMarks: studentData.internalMarks,
        assignmentScore: studentData.assignmentScore,
        cgpa: studentData.cgpa,
        backlogCount: studentData.backlogCount,
        previousSemesterPerformance: studentData.previousSemesterPerformance || 70,
        feeStatus: studentData.feeStatus || 'Paid',
        familyIncomeCategory: studentData.familyIncomeCategory || 'Medium',
        internetAccess: studentData.internetAccess || 'Yes',
        extracurricularParticipation: studentData.extracurricularParticipation || 'Moderate',
        previousCounsellingCount: studentData.previousCounsellingCount || 0
      }
    };

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.warn(`[ML Service] FastAPI request to ${ML_SERVICE_URL}/predict failed: (${error.message}). Using local ML rules engine fallback.`);
    
    // Resilient fallback logic matching ML weights
    const att = studentData.attendancePercentage || 75;
    const cgpa = studentData.cgpa || 7.0;
    const backlogs = studentData.backlogCount || 0;
    const internals = studentData.internalMarks || 65;

    let scoreRaw = (75 - att) * 0.8 + (7.0 - cgpa) * 10 + backlogs * 12 + (65 - internals) * 0.5 + 15;
    let riskScore = Math.max(5, Math.min(98, Math.round(scoreRaw)));
    
    let riskLevel = 'Low';
    if (riskScore >= 70) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    const topFactors = [];
    if (att < 75) {
      topFactors.push({
        feature: 'attendancePercentage',
        friendlyName: 'Low Attendance Rate',
        importance: 0.35,
        description: `Attendance is ${att}%, below the standard 75% requirement.`
      });
    }
    if (backlogs > 0) {
      topFactors.push({
        feature: 'backlogCount',
        friendlyName: 'Multiple Active Backlogs',
        importance: 0.30,
        description: `Student currently has ${backlogs} active backlog subject(s).`
      });
    }
    if (cgpa < 6.5) {
      topFactors.push({
        feature: 'cgpa',
        friendlyName: 'Low Cumulative GPA',
        importance: 0.25,
        description: `Current CGPA is ${cgpa}, reflecting academic difficulty.`
      });
    }
    if (internals < 55) {
      topFactors.push({
        feature: 'internalMarks',
        friendlyName: 'Low Internal Scores',
        importance: 0.15,
        description: `Internal test score average is ${internals}%.`
      });
    }
    if (topFactors.length === 0) {
      topFactors.push({
        feature: 'attendancePercentage',
        friendlyName: 'Satisfactory Academic Performance',
        importance: 0.05,
        description: 'Student academic metrics are within expected ranges.'
      });
    }

    return {
      riskScore,
      riskLevel,
      prediction: riskScore >= 50 ? 1 : 0,
      modelVersion: 'v1.0-LocalFallback',
      topFactors: topFactors.slice(0, 4)
    };
  }
};
