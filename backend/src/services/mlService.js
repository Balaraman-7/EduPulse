import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://ml-model-lkco.onrender.com';

/**
 * Calls the deployed Logistic Regression ML model on Render
 * Endpoint: POST https://ml-model-lkco.onrender.com/predict
 * Input Payload (exact 4 features expected by deployed model):
 *  - attendance_percentage
 *  - cgpa
 *  - backlog_count
 *  - internal_marks
 */
export const getDropoutPrediction = async (studentData) => {
  const payload = {
    attendance_percentage: Number(studentData.attendancePercentage) || 0,
    cgpa: Number(studentData.cgpa) || 0,
    backlog_count: Number(studentData.backlogCount) || 0,
    internal_marks: Number(studentData.internalMarks) || 0
  };

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, {
      timeout: 25000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    // Extract dropout probability (0.0 to 1.0)
    const dropoutProb = data?.probabilities?.dropout ?? (data?.prediction === 1 ? 0.8 : 0.05);
    
    // Risk score = dropout probability * 100, rounded to 1 decimal place (e.g., 7.8)
    const rawScore = dropoutProb * 100;
    const riskScore = Math.round(rawScore * 10) / 10;

    // Thresholds: 0-39.9 Low, 40-69.9 Medium, 70-100 High
    let riskLevel = 'Low';
    if (riskScore >= 70.0) {
      riskLevel = 'High';
    } else if (riskScore >= 40.0) {
      riskLevel = 'Medium';
    }

    // Model prediction: 0 = No Dropout, 1 = Dropout Risk
    const prediction = data?.prediction ?? (riskScore >= 50 ? 1 : 0);

    // Generate data-driven explanatory UI factors based strictly on input metrics
    const topFactors = [];
    const att = payload.attendance_percentage;
    const cgpa = payload.cgpa;
    const backlogs = payload.backlog_count;
    const internals = payload.internal_marks;

    if (att < 75) {
      topFactors.push({
        feature: 'attendancePercentage',
        friendlyName: 'Low Attendance Rate',
        importance: 0,
        description: `Attendance is currently ${att}%, below the recommended 75% level.`
      });
    }

    if (backlogs > 0) {
      topFactors.push({
        feature: 'backlogCount',
        friendlyName: 'Active Backlogs',
        importance: 0,
        description: `Student currently has ${backlogs} active backlog subject(s).`
      });
    }

    if (cgpa < 6.5) {
      topFactors.push({
        feature: 'cgpa',
        friendlyName: 'Low CGPA',
        importance: 0,
        description: `Current CGPA is ${cgpa}.`
      });
    }

    if (internals < 55) {
      topFactors.push({
        feature: 'internalMarks',
        friendlyName: 'Low Internal Marks',
        importance: 0,
        description: `Internal marks are currently ${internals}%.`
      });
    }

    if (topFactors.length === 0) {
      topFactors.push({
        feature: 'academicMetrics',
        friendlyName: 'Academic Metrics Within Normal Range',
        importance: 0,
        description: 'The available academic indicators are currently within the configured reference ranges.'
      });
    }

    return {
      riskScore,
      riskLevel,
      prediction,
      modelVersion: 'v1.0-LogisticRegression-Render',
      topFactors
    };
  } catch (error) {
    console.error(`[ML Service Error] Failed to reach Render ML API at ${ML_SERVICE_URL}/predict: ${error.message}`);
    throw new Error(`ML prediction service unavailable: ${error.message}`);
  }
};
